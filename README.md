# Lernprogramm
Beleg webbasiertes Lernprogramm 
  
Die Aufgabenstellung besteht aus den Teilen (die Nutzung eines eigenen Beleg-Repositories in HTWDD-RN ist verpflichtend):
* [Aufgabenstellung](Beleg-Aufgabenstellung.md)
* [Abgabeformat](Beleg-Abgabeformat.md)
* [Git/Github-Nutzung](https://github.com/HTWDD-RN/RTSP-Streaming/blob/master/git.md).

# Lernprogramm – Webbasierte Lernplattform (PWA)

## Projektbeschreibung

Dieses Lernprogramm wurde im Rahmen der Lehrveranstaltung *Internet-Technologien (IT1)* entwickelt. Es handelt sich um eine Progressive Web App (PWA), die mittels HTML5, CSS3 und JavaScript (im Architekturmodell Model-View-Presenter, MVP) umgesetzt wurde.

Der Benutzer kann:
- Eine Aufgabenkategorie auswählen (Mathematik, Web, Noten)
- Multiple-Choice-Fragen beantworten
- Fortschritt und Statistik anzeigen lassen
- Offline-Funktionalität nutzen (Service Worker)
- Ein virtuelles Klavier öffnen und Töne abspielen


## Implementierte Funktionen

### Allgemein
- HTML5-Semantik (`header`, `main`, `section`, `footer`, usw.)
- Navigation zwischen Aufgabenbereichen
- Darstellung von Fragen mit vier Antwortmöglichkeiten
- Unterstützung von KaTeX für mathematische Formeln
- Unterstützung von VexFlow für Notendarstellung
- Anzeige von Statistiken und Fortschritt (Progressbar)
- REST-API-Anbindung an den Web-Quiz-Server (mit Basic Auth)
- Responsives Design für Mobilgeräte
- Offline-Betrieb mittels Cache

### Kategorie "Mathe"
- Mathematische Formeln über KaTeX gerendert
- Aufgaben lokal im JSON-Format gespeichert
- Zufällige Auswahl von Aufgaben aus Pool
- Fehlerbehandlung bei KaTeX-Verschachtelungen (z. B. `closest("button")`)

### Kategorie "Web"
- Aufgaben über REST-API vom externen Web-Quiz-Server geladen
- Authentifizierung über HTTP Basic Auth
- Übermittlung und Validierung der Antwort über `fetch` mit `POST`

### Kategorie "Noten lernen"
- Anzeige von Noten mit VexFlow
- Unterstützung von ♯ (Kreuz) und ♭ (b) Symbolik
- Automatische Erkennung und Zeichnung von `C4`, `D#5`, `Bb3` usw.
- Integration von Aufgaben mit grafischer Notendarstellung

### Kategorie "Piano"
- Darstellung eines Klaviatur-Layouts mit weißen und schwarzen Tasten
- Tonwiedergabe beim Klicken per Web Audio API
- Umschaltung zwischen ♯/♭-Darstellung
- Visualisierung des Tastendrucks durch Farbanimation


## Architektur: Model-View-Presenter (MVP)

### Model
- `loadQuestionsFromFile()` – lädt Aufgaben aus JSON-Dateien
- `loadQuestionsFromApi()` – lädt Fragen vom Web-Quiz-Server (mit Authentifizierung). Dafür habe ich eines Account erstellt, wie im Praktikum von REST gezeigt wurde.
- `getTask()` – gibt eine neue Aufgabe aus dem gemischten Array zurück
- `checkAnswer()` – prüft, ob die gegebene Antwort korrekt ist
- `checkAnswerServer()` – übermittelt Lösung an Server und wertet Antwort aus

### Presenter
- `start()` – lädt je nach Kategorie Aufgaben lokal oder vom Server
- `setTask()` – ruft die nächste Aufgabe ab und übergibt sie an die View
- `handleAnswer()` – verarbeitet Antwort und lädt nächste Aufgabe
- `exitQuiz()` – beendet das Quiz vorzeitig

### View
- `showCategory()` – startet gewählte Kategorie
- `showQuestion()` – zeigt Frage, Antworten und Notenanzeige
- `drawNote()` – rendert Note mit VexFlow
- `clearNote()` – entfernt die Note vom Bildschirm
- `showStats()` – zeigt Ergebnisstatistik
- `setHandler()` – registriert Event-Handler

## Projektstruktur
/Lernprogramm
├── app.js
├── index.html
├── style.css
├── manifest.json
├── README.md
├── TODO.md
├── Logic of MVP.md
├── Beleg-Abgabeformat.md
├── Beleg-Aufgabenstellung.md
├── mathe-demo.html
├── images/
│ └── demo.png, logo--image.png
├── katex/
│ ├── katex.css, katex.js
│ ├── contrib/
│ └── fonts/
├── mvp-demo/
│ └── mvp.html, mvp.css, mvp.js
├── Notes/
│ └── A_note.mp3, Asharp_note.mp3, ...
├── scripts/
│ └── sw.js
├── tasks-files/
│ └── mathe.json, mathe_without_katex.json, noten.json, ...

## Verwendete Technologien

- HTML5, CSS3 (Flexbox, Media Queries)
- JavaScript (strict mode, ES6)
- Progressive Web App (Manifest + Service Worker)
- KaTeX (Mathematikdarstellung)
- VexFlow (Notenschrift)
- Web Audio API
- Fetch API + JSON
- REST API mit Basic Auth

## API

Der Web-Quiz-Server ist erreichbar unter:

**https://idefix.informatik.htw-dresden.de:8888/api**

Verwendet wird das REST-API des Projekts [Web-Quiz-Engine](https://github.com/swsms/web-quiz-engine).

## Projekt lokal starten


### Voraussetzungen:
- Webbrowser wie Firefox oder Chrome
- [Visual Studio Code](https://code.visualstudio.com/) mit Erweiterung **Live Server**
- Alle Projektdateien müssen lokal vorliegen


### Schritte:
1. Öffne den Projektordner mit VS Code
2. Rechtsklick auf `index.html` → "Open with Live Server"
3. Anwendung wird unter `http://127.0.0.1:5500/` geöffnet

## Bekannte Probleme und Lösungen

- **Mathe: Antwort klickt nicht**  
  Problem: `KaTeX` erzeugt verschachtelte `<span>`-Elemente, `event.target` zeigte auf innere Knoten.  
  Lösung: Verwendung von `event.target.closest("button")`, um sicher zur Button-Ebene zu gelangen.

- **Nächste Frage wurde nicht geladen**  
  Behebung durch `inputLocked`-Mechanismus in `handleAnswer()`.

- **KaTeX-Schriftart fehlt**  
  Lösung: Sicherstellung, dass Schriftarten im `katex/fonts` verfügbar sind.

- **Letzte Note bleibt sichtbar**  
  Lösung: `clearNote()` in View bei Kategorie-Wechsel implementiert.

- **Kein Ton bei Piano**  
  Fehlerhafte Pfadangabe zu `.mp3`-Dateien wurde korrigiert.

## Unterstützung durch KI (ChatGPT)

Einige Teile dieses Projekts wurden unter Nutzung von ChatGPT (GPT-4) unterstützt. Insbesondere:

- Hilfe bei Event-Handlern (`addEventListener`) und Bugfix mit `event.target.closest()`
- Erstellung des Service Workers und Cache-Strategien
- Auswahl eines Google Fonts, der visuell dem HTW-Stil ähnelt
- Übersetzung dieses README von Russisch ins Deutsche
- Debugging-Unterstützung beim Analyseprozess der Antwort-Klicks in `Mathe`

Alle relevanten Teile wurden überprüft, getestet und dokumentiert.


## Autor

**Radmir Mullagaliev**  
Matrikelnummer: s85138  
HTW Dresden, Fakultät Informatik

## Erledigte Punkte

- [x] HTML/CSS-Struktur
- [x] Aufgabenanzeige und Auswahl
- [x] Mathe mit KaTeX
- [x] API-Anbindung
- [x] Notenanzeige mit VexFlow
- [x] Virtuelles Piano mit Ton
- [x] Offline-Nutzung via Service Worker
- [x] Dokumentation (README)