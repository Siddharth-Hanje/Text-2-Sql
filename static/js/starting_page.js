document.addEventListener("keypress", function(event){
    if(event.key === "Enter"){
        // fetch("/home", { method: "GET" });
        window.location.href = "/home";
    }
});