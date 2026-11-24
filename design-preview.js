(function(){
  'use strict';
  var root=document.documentElement,button=document.getElementById('themeToggle');
  if(button)button.addEventListener('click',function(){
    var dark=root.dataset.theme!=='dark';
    root.dataset.theme=dark?'dark':'light';
    button.textContent=dark?'☼  Light mode':'◐  Dark mode';
    button.setAttribute('aria-pressed',String(dark));
  });
  document.querySelectorAll('.nav a').forEach(function(link){
    link.addEventListener('click',function(){
      document.querySelectorAll('.nav a').forEach(function(item){item.classList.remove('active');item.removeAttribute('aria-current');});
      link.classList.add('active');link.setAttribute('aria-current','page');
    });
  });
})();