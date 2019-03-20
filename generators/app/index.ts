import * as download from 'download-git-repo';
import * as fs from 'fs';
import { kebabCase } from 'lodash';
import * as Generator from 'yeoman-generator';
import yosay = require('yosay');

module.exports = class extends Generator {
    answers: any;

    constructor(args, opts) {
        super(args, opts);
    }

    initializing() {
        this.log(yosay('Start up a new TypeDI Project!'));

        download('teamhive/typedi-seed', `${__dirname}/templates`, err => {
            if (err) {
                // tslint:disable-next-line:no-console
                console.error('There was an issue downloading the latest template files. (teamhive/typedi-seed)', err);
                process.exit();
            }

            fs.copyFileSync(`${__dirname}/_package.json`, `${__dirname}/templates/package.json`);
            fs.copyFileSync(`${__dirname}/_README.md`, `${__dirname}/templates/README.md`);

            return;
        });
    }

    async prompting() {
        this.answers = await this.prompt([{
            type: 'input',
            name: 'appname',
            message: 'Package name',
            default: this.appname
        }, {
            type: 'input',
            name: 'description',
            message: 'Package description'
        }, {
            type: 'input',
            name: 'gitUser',
            message: 'GitHub user or organization',
        }, {
            type: 'input',
            name: 'authorName',
            message: 'Author name'
        }, {
            type: 'input',
            name: 'authorUsername',
            message: 'Author username'
        }]);
    }

    writing() {
        this.fs.copyTpl(
            this.templatePath('**'),
            this.destinationPath(),
            this.replacements()
        );

    }

    install() {
        this.installDependencies({
            npm: true,
            bower: false
        });
    }

    private replacements() {
        return {
            moduleName: kebabCase(this.answers.appname),
            description: this.answers.description,
            authorName: this.answers.authorName,
            authorUsername: this.answers.authorUsername,
            gitUser: this.answers.gitUser
        };
    }
};