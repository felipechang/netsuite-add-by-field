const child_process = require("child_process");
const fs = require("fs");
const minify = require('minify');
const inliner = require("html-inline");

const sequentialExecution = (...commands) => {

    if (commands.length === 0) {
        return;
    }

    for (let i = 0; i < commands.length; i++) {

        if (typeof commands[i] === "string") {
            child_process.exec(commands[i], (error) => {
                if (error) {
                    throw error;
                }
            });
        } else {
            commands[i]();
        }
    }
};

sequentialExecution(
    "tslint source/**/*.ts",
    "tsc",
    () => {

        const writeStream = fs.createWriteStream("source/temp/out.html");
        const readStream = fs.createReadStream('source/assets/add_by_field.html');

        const transformStream = inliner({
            basedir: "./source/assets"
        });
        transformStream.pipe(writeStream);
        readStream.pipe(transformStream);
        writeStream.on("close", () => {
            const template = fs.readFileSync("source/add_by_field_userevent.js", "utf8");
            minify("source/temp/out.html", {
                html: {
                    removeAttributeQuotes: false,
                }
            })
                .then((out) => {
                    const data = template.replace("<%= out %>", out.replace(/"/g, "'"));
                    fs.writeFileSync("deploy/add_by_field_userevent.js", data);
                })
                .catch(console.error);
        })
    }
);