function solve(inp){
    return inp.parentNode.parentNode.parentNode.firstElementChild.firstElementChild.innerHTML
}

function disable(btn)
{
    btn.disabled = true
    btn.innerHTML = 'Solved'
    btn.style.border = "none"
}