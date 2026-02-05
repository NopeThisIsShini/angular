const fs = require('fs');
const path = require('path');

// When located in /scripts/, the project root is one level up
const rootDir = path.join(__dirname, '..');

// Load config
const configPath = path.join(rootDir, 'scripts', 'ng-rename.json');
if (!fs.existsSync(configPath)) {
    console.error('❌ ng-rename.json not found in /scripts/ folder!');
    process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const { packageName, appName } = config;

if (!packageName || !appName) {
    console.error('❌ Please provide both packageName and appName in app-name.config.json');
    process.exit(1);
}

console.log(`🚀 Renaming application to: ${appName} (${packageName})...`);

// 1. Update package.json
const packagePath = path.join(rootDir, 'package.json');
if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const oldPackageName = packageJson.name;
    packageJson.name = packageName;

    // Update scripts that might use the old package name
    if (packageJson.scripts) {
        Object.keys(packageJson.scripts).forEach(key => {
            if (typeof packageJson.scripts[key] === 'string') {
                packageJson.scripts[key] = packageJson.scripts[key].replace(new RegExp(oldPackageName, 'g'), packageName);
            }
        });
    }
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4));
    console.log(`✅ Updated package.json: ${oldPackageName} -> ${packageName}`);

    // Update ESLint config if it uses the package name
    const eslintPath = path.join(rootDir, 'eslint.config.js');
    if (fs.existsSync(eslintPath)) {
        let eslintContent = fs.readFileSync(eslintPath, 'utf8');
        if (eslintContent.includes(oldPackageName)) {
            eslintContent = eslintContent.replace(new RegExp(oldPackageName, 'g'), packageName);
            fs.writeFileSync(eslintPath, eslintContent);
            console.log(`✅ Updated eslint.config.js`);
        }
    }
} else {
    console.error('❌ package.json not found!');
}

// 2. Update angular.json
const angularPath = path.join(rootDir, 'angular.json');
if (fs.existsSync(angularPath)) {
    const angularJson = JSON.parse(fs.readFileSync(angularPath, 'utf8'));
    const projectNames = Object.keys(angularJson.projects);
    
    projectNames.forEach(oldProjectName => {
        // If there's only one project, or if the project name matches the old package name
        // we'll assume it's the main project to rename
        if (projectNames.length === 1 || oldProjectName === 'angular_template' || oldProjectName === packageName) {
            const projectConfig = angularJson.projects[oldProjectName];
            delete angularJson.projects[oldProjectName];
            
            // Replace references within the project config
            let projectStr = JSON.stringify(projectConfig);
            projectStr = projectStr.replace(new RegExp(oldProjectName, 'g'), packageName);
            angularJson.projects[packageName] = JSON.parse(projectStr);
            
            console.log(`✅ Updated angular.json project: ${oldProjectName} -> ${packageName}`);
        }
    });

    if (angularJson.defaultProject && projectNames.includes(angularJson.defaultProject)) {
        angularJson.defaultProject = packageName;
    }

    fs.writeFileSync(angularPath, JSON.stringify(angularJson, null, 2));
}

// 3. Update index.html title
const indexHtmlPath = path.join(rootDir, 'src', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    const titleRegex = /<title>.*<\/title>/;
    if (titleRegex.test(indexHtml)) {
        indexHtml = indexHtml.replace(titleRegex, `<title>${appName}</title>`);
        fs.writeFileSync(indexHtmlPath, indexHtml);
        console.log(`✅ Updated index.html title: ${appName}`);
    }
}

// 4. Update README if it exists
const readmePath = path.join(rootDir, 'README.md');
if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    readme = readme.replace(/^# .*/m, `# ${appName}`);
    fs.writeFileSync(readmePath, readme);
    console.log(`✅ Updated README.md title`);
}

console.log('\n✨ App renamed successfully! ✨');
console.log('💡 Note: You may need to run "npm install" to update package-lock.json.');
console.log('💡 Note: If you are running the app (ng serve), you should restart it.');
