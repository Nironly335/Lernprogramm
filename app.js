"use strict";

//let presenter, view, model;
document.addEventListener('DOMContentLoaded', function () {
    let model = new Model();
    let presenter = new Presenter();
    let view = new View(presenter);
    presenter.setModelAndView(model, view);
    //p.setTask();

    document.querySelectorAll("[data-category]").forEach(button => {
        button.addEventListener("click", () => {
            view.showCategory(button); // передаём нажатую кнопку
        });
    });
});

// ############# Model ###########################################################################
class Model {
    constructor() { 
        this.questions = []; //я понимаю, что неверно, помоги сделать
        this.shuffled = [];
        this.correctAn = 0;
        this.incorrectAn = 0;
        this.currentIndex = 0;
    }

    randomQuestions(questions) {
        this.shuffled = questions.sort(() => Math.random() - 0.5);
    }

    // Holt eine Frage aus dem Array, zufällig ausgewählt oder vom Server
    getTask() {
        if (this.currentIndex < this.shuffled.length) {
            return this.shuffled[this.currentIndex++];
        } else {
            return null; // all questions are answered
        }
    }

    

    checkAnswer(userAnswerIndex) {
        if (userAnswerIndex === 
        this.shuffled[this.currentIndex - 1].correct) {
            this.correctAn++;
        } else {
            this.incorrectAn++;
        }
    }

    async loadQuestionsFromFile(filename) {
        const response = await fetch(filename);
        const data = await response.json();
        this.questions = data;
        this.randomQuestions(data);
        this.currentIndex = 0;
    }

    async loadQuestionsFromApi(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.questions = data;
            this.randomQuestions(data);
            this.currentIndex = 0;
        } catch (error) {
            console.error("Fehler beim Laden der Aufgaben:", error);
        }
    }


}

// ############ Controller ########################################################################
class Presenter {
    constructor() {
        this.model = null;
        this.view = null;
    }

    setModelAndView(model, view) {
        this.model = model;
        this.view = view;
    }

    start(category) {
        if(category == "web") {
            const url = "/tasks-files/web.json" //example file
            //const url = ""; // my server url
            this.model.loadQuestionsFromApi(url).then(() => {
            this.setTask();
            });
        } else {
            const file = `tasks-files/${category}.json`;
            this.model.loadQuestionsFromFile(file).then(() => {this.setTask();});
        }
    }

     // Holt eine neue Frage aus dem Model und setzt die View
    setTask() {
        const task = this.model.getTask();

        if (task) {
            this.view.showQuestion(task);
        } else {
            this.view.showStats(this.model.correctAn, this.model.incorrectAn);
        }
        /*let frag = this.m.getTask(this.anr);
        View.renderText(frag);
        for (let i = 0; i < 4; i++) {
            let wert = "42";
            let pos = i;
            View.inscribeButtons(i, wert, pos); // Tasten beschriften -> View -> Antworten
        }*/
    }

    // Prüft die Antwort, aktualisiert Statistik und setzt die View
    /*checkAnswer(answer) {
        console.log("Antwort: ", answer);
    }*/

    handleAnswer(index) {
        const isCorrect = this.model.checkAnswer(index);
        //this.view.showFeedback(isCorrect); if we want show, is user right
        this.setTask();
    }

    exitQuiz() {
        this.view.showStats(this.model.correctAn, this.model.inccorrectAn);
    }
}

// ##################### View #####################################################################
class View {
    constructor(presenter) {
        this.presenter = presenter;  // Presenter
        this.setHandler();
    }

    showCategory(button) {
        const category = button.dataset.category;
        this.presenter.start(category);
    }

    showQuestion(task) {
        // Спрятать блок выбора категории
        document.getElementById("category-selection").hidden = true;
    
        // Показать блок вопросов
        document.getElementById("question-area").hidden = false;
    
        // Показать текст вопроса
        //document.getElementById("question-text").textContent = task.question; //works without katex
        document.getElementById("question-text").innerHTML = task.question; //works with katex

        renderMathInElement(document.getElementById("question-text"), {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "\\(", right: "\\)", display: false }
            ]
        });
    
        // Очистить предыдущие кнопки
        const container = document.getElementById("answer");
        container.innerHTML = "";
    
        // Добавить новые кнопки
        task.answers.forEach((answer, index) => {
            const btn = document.createElement("button");
            //btn.textContent = answer; //works without Katex
            btn.innerHTML = answer; //works with Katex
            btn.dataset.index = index;
            container.appendChild(btn);
        });
        renderMathInElement(container, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "\\(", right: "\\)", display: false }
            ]
        });
    }

    setHandler() {
        // use capture false -> bubbling (von unten nach oben aufsteigend)
        // this soll auf Objekt zeigen -> bind (this)
        document.getElementById("answer").addEventListener("click", (event) => {
            if (event.target.nodeName === "BUTTON") {
                const index = Number(event.target.dataset.index);
                this.presenter.handleAnswer(index);
            }
        });

        document.getElementById("exit-quiz").addEventListener("click", () => {
            this.presenter.exitQuiz();
        });
        //old kusok
        //document.getElementById("start").addEventListener("click", this.start.bind(this), false);
    }

    //start() {
    //    this.presenter.setTask();
    //}

    showStats(correct = 0, incorrect = 0) {
        document.getElementById("question-area").hidden = true;
        document.getElementById("result-area").hidden = false;

        document.getElementById("stats").textContent =
            `Richtig: ${correct}, Falsch: ${incorrect}`;

            setTimeout(() => {
                document.getElementById("result-area").hidden = true;
                document.getElementById("category-selection").hidden = false;
        
                this.presenter.model.currentIndex = 0;
                this.presenter.model.correctAn = 0;
                this.presenter.model.incorrectAn = 0;
            }, 3000);   
    }


    

    static renderText(text) {
        //this.clearElement("boo");
        let div = document.getElementById("boo");
        let p = document.createElement("p");
        p.innerHTML = text;
        div.appendChild(p);
    }


    //говно старое
    static inscribeButtons(i, text, pos) {
        document.querySelectorAll("#answer > *")[i].textContent = text;
        document.querySelectorAll("#answer > *")[i].setAttribute("number", pos);
    }

    checkEvent(event) {
        console.log(event.type);
        if (event.target.nodeName === "BUTTON") {
            this.p.checkAnswer(Number(event.target.attributes.getNamedItem("number").value));
        }
    }
}