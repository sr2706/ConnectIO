const returntohomeButton=document.querySelector('.home');
returntohomeButton.addEventListener('click',()=>{
    window.location.href = '/';
})


const countDisplay=document.querySelector('.counts h5');
function countDown(count){
    countDisplay.innerHTML=count;
}

let cnt=10;
let counting=setInterval(()=>{
    countDown(cnt);
    if(cnt==0){
        clearInterval(counting);
        window.location.href='/';
    }
    cnt--;
},1000);