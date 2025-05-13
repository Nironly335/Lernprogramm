"use strict";

//let presenter, view, model;
document.addEventListener('DOMContentLoaded', function () {
    let model = new Model();
    let presenter = new Presenter();
    let view = new View(presenter);
    presenter.setModelAndView(model, view);

    document.querySelectorAll("[data-category]").forEach(button => {
        button.addEventListener("click", () => {
            view.showCategory(button);
        });
    });

    // Обработчики пианино
    document.querySelectorAll("#piano .white-key, #piano .black-key").forEach(key => {
        key.addEventListener("click", () => {
            const note = key.dataset.note;
            const filename = note + "_note.mp3";
            const audio = new Audio(`Notes/${filename}`);
            audio.play();

            key.classList.add("active");
            setTimeout(() => {
                key.classList.remove("active");
            }, 150);
        });
    });

    let useFlats = false;
    const toggleBtn = document.getElementById("toggle-accidentals");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            useFlats = !useFlats;
            document.querySelectorAll(".black-key").forEach(key => {
                key.textContent = useFlats ? key.dataset.alt : key.dataset.note.replace("sharp", "♯");
            });
        });
    }
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

    /* Old
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
    }*/

    async loadQuestionsFromApi(url, credentials) {
    const response = await fetch(url, {
        headers: {
            "Authorization": "Basic " + btoa(credentials.email + ":" + credentials.password)
        }
    });
    const result = await response.json();
    const rawQuestions = result.content || [];

    this.shuffled = rawQuestions.map(q => ({
        id: q.id,
        question: q.text,
        answers: q.options
    })).sort(() => Math.random() - 0.5);

    this.correctAn = 0;
    this.incorrectAn = 0;
    this.currentIndex = 0;
    }   
    
    async checkAnswerServer(index, credentials) {
        const task = this.shuffled[this.currentIndex - 1]; // последний показанный вопрос
    
        const response = await fetch(`https://idefix.informatik.htw-dresden.de:8888/api/quizzes/${task.id}/solve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic " + btoa(credentials.email + ":" + credentials.password)
            },
            body: JSON.stringify([index])
        });
    
        const result = await response.json();
        if (result.success) {
            this.correctAn++;
        } else {
            this.incorrectAn++;
        }
    }


}

// ############ Controller ########################################################################
class Presenter {
    constructor() {
        this.model = null;
        this.view = null;
        this.credentials = { email: "s85138@htw-dresden.de", password: "Passwort" };
    }

    setModelAndView(model, view) {
        this.model = model;
        this.view = view;
    }

    start(category) {
        this.currentCategory = category;
        if(category == "web") {
            const url = "https://idefix.informatik.htw-dresden.de:8888/api/quizzes"; //example file
            //const url = ""; // my server url
            this.model.loadQuestionsFromApi(url, this.credentials).then(() => {
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
        console.log("Neue Frage setzen");
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
        //const isCorrect = this.model.checkAnswer(index);
        //this.view.showFeedback(isCorrect); if we want show, is user right
        //this.setTask();

        if (this.currentCategory === "web") {
            this.model.checkAnswerServer(index, this.credentials).then(() => {
                this.setTask();
            });
        } else {
            this.model.checkAnswer(index);
            console.log("Antwort gedrückt:", index);
            this.setTask();
        }
        console.log("MATHE: handleAnswer(", index, ")");
    }

    exitQuiz() {
        this.view.showStats(this.model.correctAn, this.model.incorrectAn);
    }

}

// ##################### View #####################################################################
class View {
    constructor(presenter) {
        this.presenter = presenter;  // Presenter
        this.setHandler();
        this.inputLocked = false; //bugfix
    }

    showCategory(button) {
        const category = button.dataset.category;
        this.presenter.start(category);
        this.currentCategory = category;
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
        if (task.note) {
            this.drawNote(task.note);
        }
        
        this.inputLocked = false;
    }

    /*setHandler() {
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

        document.getElementById("open-piano").addEventListener("click", () => {
            document.getElementById("category-selection").hidden = true;
            document.getElementById("piano-section").hidden = false;
        });

        document.getElementById("exit-piano").addEventListener("click", () => {
            document.getElementById("piano-section").hidden = true;
            document.getElementById("category-selection").hidden = false;
        });
        //old kusok
        //document.getElementById("start").addEventListener("click", this.start.bind(this), false);
    } before bugfixing*/
    setHandler() {
        // use capture false -> bubbling (von unten nach oben aufsteigend)
        // this soll auf Objekt zeigen -> bind (this)
        document.getElementById("answer").addEventListener("click", (event) => {
            if (this.inputLocked) return; // блокировка
        
            if (event.target.nodeName === "BUTTON") {
                this.inputLocked = true; // блокируем повторный клик
                const index = Number(event.target.dataset.index);
                this.presenter.handleAnswer(index);
            }
        });
        



        document.getElementById("exit-quiz").addEventListener("click", () => {
            this.presenter.exitQuiz();
        });

        document.getElementById("open-piano").addEventListener("click", () => {
            document.getElementById("category-selection").hidden = true;
            document.getElementById("piano-section").hidden = false;
        });

        document.getElementById("exit-piano").addEventListener("click", () => {
            document.getElementById("piano-section").hidden = true;
            document.getElementById("category-selection").hidden = false;
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

    drawNote(note = "C4") {
        const VF = Vex.Flow;
        console.log("drawNote wurde aufgerufen: ", note);
        const div = document.getElementById("vex-container");
        div.innerHTML = ""; // очистить при смене задания
        const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
        renderer.resize(250, 150);
        const context = renderer.getContext();
    
        const stave = new VF.Stave(10, 40, 200);
        stave.addClef("treble").setContext(context).draw();
        //classic format (D4)
        // const notes = [new VF.StaveNote({ clef: "treble", keys: [note], duration: "q" })];
    
        const formattedNote = note[0].toLowerCase() + "/" + note[1];
        const notes = [new VF.StaveNote({ clef: "treble", keys: [formattedNote], duration: "q" })];
        
        // Добавим диез или бемоль, если нужно
        if (note.includes("#")) {
            notes[0].addAccidental(0, new VF.Accidental("#"));
        } else if (note.includes("b")) {
            notes[0].addAccidental(0, new VF.Accidental("b"));
        }
    
        const voice = new VF.Voice({ num_beats: 1, beat_value: 4 });
        voice.addTickables(notes);
    
        const formatter = new VF.Formatter().joinVoices([voice]).format([voice], 200);
        voice.draw(context, stave);
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