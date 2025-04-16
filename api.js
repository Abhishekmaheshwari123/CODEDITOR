const express = require("express");
const app = express();
const bodyP = require("body-parser");
const compiler = require("compilex");

const options = { stats: true };
compiler.init(options);

app.use(bodyP.json());
app.use("/codemirror-5.65.16", express.static("C:/Users/mahes/OneDrive/Desktop/codeditor/codemirror-5.65.16"));

app.get("/", function (req, res) {
    compiler.flush(function () {
        console.log("Deleted");
    });
    res.sendFile("C:/Users/mahes/OneDrive/Desktop/codeditor/index.html");
});

app.post("/compile", function (req, res) {
    const code = req.body.code;
    const input = req.body.input;
    const lang = req.body.lang;

    try {
        if (lang === "C++") {
            const envData = { OS: "windows", cmd: "g++" };
            if (!input) {
                compiler.compileCPP(envData, code, function (data) {
                    res.send(parseErrorMessage(data, "C++"));
                });
            } else {
                compiler.compileCPPWithInput(envData, code, input, function (data) {
                    res.send(parseErrorMessage(data, "C++"));
                });
            }
        } else if (lang === "Java") {
            const envData = { OS: "windows" };
            if (!input) {
                compiler.compileJava(envData, code, function (data) {
                    res.send(parseErrorMessage(data, "Java"));
                });
            } else {
                compiler.compileJavaWithInput(envData, code, input, function (data) {
                    res.send(parseErrorMessage(data, "Java"));
                });
            }
        } else if (lang === "Python") {
            const envData = { OS: "windows" };
            if (!input) {
                compiler.compilePython(envData, code, function (data) {
                    res.send(parseErrorMessage(data, "Python"));
                });
            } else {
                compiler.compilePythonWithInput(envData, code, input, function (data) {
                    res.send(parseErrorMessage(data, "Python"));
                });
            }
        } else {
            res.send({ output: "Error: Unsupported Language Selected" });
        }
    } catch (e) {
        console.error("Server Error:", e);
        res.send({ output: `Server Error: ${e.message}` });
    }
});

app.listen(8000, () => {
    console.log("Server running on port 8000");
});

/**
 * Parses error messages to extract line numbers and specific errors.
 */
function parseErrorMessage(data, lang) {
    if (data.error) {
        let errorMsg = data.error;
        let lineNumber = "Unknown";

        if (lang === "C++") {
            // Match "file.cpp:3: error:" -> Extracts line number 3
            let match = errorMsg.match(/\.cpp:(\d+):/);
            if (match) lineNumber = match[1];
        } else if (lang === "Java") {
            // Match "Main.java:5: error:" -> Extracts line number 5
            let match = errorMsg.match(/\.java:(\d+):/);
            if (match) lineNumber = match[1];
        } else if (lang === "Python") {
            // Match 'File "script.py", line 4' -> Extracts line number 4
            let match = errorMsg.match(/line (\d+)/);
            if (match) lineNumber = match[1];
        }

        return { output: `Error at Line ${lineNumber}: ${errorMsg}` };
    }
    
    return data; // If no error, return normal output
}
