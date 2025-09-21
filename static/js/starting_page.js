document.addEventListener("keypress", function(event){
    if(event.key === "Enter"){
        alert("Key pressed");
        // fetch("/home", { method: "GET" });
        window.location.href = "/home";
    }
});