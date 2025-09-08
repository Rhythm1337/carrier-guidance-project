async function loadPathData() {
  const res = await fetch('data/paths.json');
  if (!res.ok) throw new Error('Failed to load path data');
  return await res.json();
}
