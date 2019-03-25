import * as download from 'download-git-repo';
import * as fs from 'fs';
import { kebabCase } from 'lodash';
import * as sortPackageJson from 'sort-package-json';
import * as Generator from 'yeoman-generator';
import yosay = require('yosay');

module.exports = class extends Generator {
    answers: any;

    constructor(args, opts) {
        super(args, opts);
    }

    initializing() {
        this.log(yosay('Start up a new TypeDI Project!'));

        // download typedi-seed repo from github
        download('teamhive/typedi-seed', `${__dirname}/templates`, err => {
            if (err) {
                // tslint:disable-next-line:no-console
                console.error('There was an issue downloading the latest template files. (teamhive/typedi-seed)', err);
                process.exit();
            }

            // read both files into js objects
            const seedPackage = require(`${__dirname}/templates/package.json`);
            const generatorPackage = require(`${__dirname }/_package.json`);

            // combine package properties and sort
            const combinedPackage = { ...seedPackage, ...generatorPackage };
            const sortedPackage = sortPackageJson(combinedPackage);

            // overwrite templates/package.json with combined package
            fs.writeFileSync(`${__dirname}/templates/package.json`, JSON.stringify(sortedPackage, null, 4));

            // overwrite seed README
            fs.copyFileSync(`${__dirname}/_README.md`, `${__dirname}/templates/README.md`);
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
            default: 'TeamHive'
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
            this.replacements(),
            {},
            { globOptions: { dot: true } }
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