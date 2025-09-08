let data, pathKey, answers = {}, step = 0;

async function init() {
  try {
    data = await loadPathData();
    const params = new URLSearchParams(location.search);
    const page = location.pathname.split('/').pop();

    if (page === 'quiz.html') {
      startQuiz(params.get('path') || '10th');
    }
    if (page === 'results.html') {
      showResults(params);
    }
  } catch (error) {
    console.error("Initialization failed:", error);
    document.body.innerHTML = "<h2>Oops! Something went wrong. Could not load quiz data. Please try again later.</h2>";
  }
}

function startQuiz(path) {
  pathKey = path;
  answers = JSON.parse(localStorage.getItem(`answers-${pathKey}`) || '{}');
  const qdata = data[pathKey].questions;
  renderQuestion(qdata);
  document.getElementById('next-btn').onclick = () => next(qdata);
  document.getElementById('back-btn').onclick = () => back(qdata);
}

function renderQuestion(qs) {
  const q = qs[step];
  document.getElementById('question-text').textContent = q.text;
  const optsContainer = document.getElementById('options');
  optsContainer.innerHTML = '';

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.dataset.value = opt.text;
    btn.onclick = () => select(q.key, opt.text, btn);

    if (answers[q.key] === opt.text) {
      btn.classList.add('selected');
    }
    optsContainer.appendChild(btn);
  });
  updateNav(qs.length);
}

function select(key, value, selectedBtn) {
  answers[key] = value;
  localStorage.setItem(`answers-${pathKey}`, JSON.stringify(answers));

  document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
  selectedBtn.classList.add('selected');
  document.getElementById('next-btn').disabled = false;
}

function updateNav(total) {
  document.getElementById('back-btn').disabled = step === 0;
  const currentQuestionKey = data[pathKey].questions[step].key;
  document.getElementById('next-btn').disabled = !answers[currentQuestionKey];
  const progress = (step / (total - 1)) * 100;
  document.getElementById('progress').style.width = `${progress}%`;
}

function next(qs) {
  if (step < qs.length - 1) {
    step++;
    renderQuestion(qs);
  } else {
    localStorage.removeItem(`answers-${pathKey}`);
    const query = new URLSearchParams(answers).toString();
    location.href = `results.html?path=${pathKey}&${query}`;
  }
}

function back(qs) {
  if (step > 0) {
    step--;
    renderQuestion(qs);
  }
}

function showResults(params) {
  const path = params.get('path');
  if (!path || !data[path]) {
    document.getElementById('results-container').innerHTML = '<h2>Invalid path. Please start over.</h2>';
    return;
  }
  const results = calculateResults(params, path);
  const container = document.getElementById('results-container');
  container.innerHTML = ''; // Clear loading message

  // 1. Build Score Breakdown Card
  container.appendChild(createScoreBreakdownCard(results.sorted));

  // 2. Build Primary Recommendation Card
  container.appendChild(createRecommendationCard(results.sorted[0].stream, 'primary', path));

  // 3. Build Secondary Recommendation Card
  if (results.sorted.length > 1 && results.sorted[1].score > 0) {
    container.appendChild(createRecommendationCard(results.sorted[1].stream, 'secondary', path));
  }
  
  // Animate score bars after they are in the DOM
  requestAnimationFrame(() => {
    document.querySelectorAll('.score-bar').forEach(bar => {
        bar.style.width = bar.dataset.width;
    });
  });
}

function calculateResults(params, path) {
    const scores = {};
    const pathStreams = data[path].streams;
    for (const stream in pathStreams) {
        scores[stream] = 0;
    }

    const questions = data[path].questions;
    let totalScorePoints = 0;

    for (const [key, value] of params) {
        if (key === 'path') continue;
        const question = questions.find(q => q.key === key);
        if (!question) continue;

        const selectedOption = question.options.find(opt => opt.text === value);
        if (selectedOption && selectedOption.scores) {
            for (const stream in selectedOption.scores) {
                if (scores.hasOwnProperty(stream)) {
                    scores[stream] += selectedOption.scores[stream];
                }
            }
        }
    }
    
    // Calculate total score for percentage
    for (const stream in scores) {
        totalScorePoints += scores[stream];
    }
    if (totalScorePoints === 0) totalScorePoints = 1; // Avoid division by zero

    // Convert to percentage and sort
    const sorted = Object.entries(scores)
        .map(([stream, score]) => ({ stream, score, percentage: Math.round((score / totalScorePoints) * 100) }))
        .sort((a, b) => b.score - a.score);

    return { sorted };
}

function createScoreBreakdownCard(sortedScores) {
    const card = document.createElement('div');
    card.className = 'results-card score-breakdown';
    let content = '<h2>Your Affinity Score</h2>';

    sortedScores.forEach(({ stream, percentage }) => {
        content += `
            <div class="score-bar-container">
                <div class="score-bar-label">
                    <span>${stream}</span>
                    <span>${percentage}%</span>
                </div>
                <div class="score-bar-bg">
                    <div class="score-bar" data-width="${percentage}%"></div>
                </div>
            </div>
        `;
    });
    card.innerHTML = content;
    return card;
}

function createRecommendationCard(streamName, type, path) {
    const streamInfo = data[path].streams[streamName];
    const card = document.createElement('div');
    card.className = `results-card recommendation-card ${type}`;

    const title = type === 'primary' ? 'Your Primary Recommendation' : 'A Strong Secondary Option';
    const flowchartText = `${streamName.replace(/\s/g, '+')}+Career+Path+Flowchart`;
    
    card.innerHTML = `
        <span class="tag">${title}</span>
        <h2>${streamName}</h2>
        <p>${streamInfo.description}</p>
        <blockquote><p><strong>Expert Tip:</strong> ${streamInfo.expertTip}</p></blockquote>

        <h3>Career Path Flowchart</h3>
        <img src="https://placehold.co/800x400/eaf4ff/004a91?text=${flowchartText}" alt="${streamName} career path flowchart" class="flowchart-img">
        
        <div class="info-grid">
            <div>
                <h3>Potential Careers</h3>
                <ul>${streamInfo.careers.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>
            <div>
                <h3>Top Entrance Exams</h3>
                <ul>${streamInfo.exams.map(e => `<li>${e}</li>`).join('')}</ul>
            </div>
        </div>

        <h3>Key Courses & Resources</h3>
        <ul>${streamInfo.courses.map(c => `<li><a href="${c.url}" target="_blank" rel="noopener noreferrer">${c.name}</a></li>`).join('')}</ul>
    `;
    return card;
}

window.addEventListener('DOMContentLoaded', init);
