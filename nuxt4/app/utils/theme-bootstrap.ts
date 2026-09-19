// Runs in the SSR head before body paint. Only validated color tokens are restored;
// the color engine remains lazy-loaded, and storage failures leave SSR defaults intact.
export const themeBootstrapScript = `(()=>{try{
  const root=document.documentElement;
  if(JSON.parse(localStorage.getItem('shirone:display')||'null')?.reduced)root.classList.add('motion-reduced');
  const mode=localStorage.getItem('shirone:theme');
  const dark=mode==='dark'||((!mode||mode==='auto')&&matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark',dark);
  const palette=JSON.parse(localStorage.getItem('shirone:palette')||'null');
  const cache=JSON.parse(localStorage.getItem('shirone:palette-cache:v1')||'null');
  if(!palette||cache?.key!==JSON.stringify([palette.hue,palette.style,palette.spec,dark]))return;
  const entries=Object.entries(cache.colors||{});
  if(!entries.length||!entries.every(([role,value])=>/^[a-z][a-zA-Z]*$/.test(role)&&typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)))return;
  for(const [role,value] of entries){
    const name=role.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
    root.style.setProperty('--'+name,value);
    root.style.setProperty('--mc-'+name,value);
  }
}catch{}})()`;
