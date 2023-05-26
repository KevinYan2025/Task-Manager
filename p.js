const add = (a,b) => {
    return new Promise((resolve,response) => {
        setTimeout(()=>{
            resolve(a+b)
        },2000)
    })
}

add(3,6).then((sum)=>{
    console.log(sum)
})
.catch((error)=>{
    console.log(error);
})

