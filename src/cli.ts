import minimist from "minimist"
import { resolve, dirname } from "path"
import { statSync, existsSync } from "fs"
// @ts-ignore
import log from "@tryghost/logging"
import deploy from "."
// @ts-ignore
import errors from "@tryghost/errors"


let args = minimist(process.argv.slice(2), {
    alias: {
        c: "config",
        h: "help",
        q: "quiet",
        p: "preserve"
    }
})

if (args.help) {
    console.log("ghostify help\n\n"
        + "Usage: ghostify <config file or theme path> [options]\n\n"
        + "Basic options:\n\n"
        + "-c, --config <filename>    the ghostify.json config containing your admin api key and url and others theme informations \n"
        + "-q, --quiet                do not output the deployment logs: default is false\n"
        + "-p, --preserve             whever to keep the zip theme after deploy : default is false\n"
        + "-h, --help                 output this help and exit\n\n"
        + "Exemples: \n\n"
        + "# use in theme base directory\n$ ghostify \n\n"
        + "# specify the config file\n$ ghostify -c[onfig] <file path>\n$ ghostify <config file path>\n\n"
        + "# specify the theme base path containing the config file and package.json\n"
        + "$ ghostify <theme path>")

    process.exit(0)
}

let configPath = resolve(args.config || args._[0] || process.cwd())
let debug = !args.quiet

let basePath: string, pkgPath: string

if (statSync(configPath).isDirectory()) {
    basePath = configPath
    configPath = resolve(basePath, "ghostify.js")
    if (!existsSync(configPath)) {
        configPath = resolve(basePath, "ghostify.json")
    }
} else {
    basePath = dirname(configPath)
}

pkgPath = resolve(basePath, "package.json")

if (!existsSync(configPath)) {
    log.error("there is no config file")
    process.exit(1)
}

let { apiKey, apiUrl, themeName, excludes, preserve } = require(configPath.replace(/\\/g, "/"))

themeName = themeName || (() => { try { return require(pkgPath.replace(/\\/g, "/")) } catch (err) { return {} } })().name
if (!(apiKey && apiUrl && themeName)) {
    log.error("those value are required: apiKey, apiUrl, and themeName but seam to be absent")
    process.exit(1)
}
preserve = args.preserve !== undefined ? args.preserve : preserve

let startTime = Date.now()
log.info("starting deploy of theme " + themeName)

deploy({
    apiKey,
    apiUrl,
    themeName,
    basePath,
    excludes,
    preserve,
    debug
}).then((res) => {
    let elipsed = ((Date.now() - startTime) / 1000).toFixed(3)
    if (res?.errors) {
        log.error(res.errors)
        return
    }
    return log.info("deploy finished successfuly withing " + elipsed + " s.")
}).catch(error => {
    if(!errors.utils.isGhostError(error)){
        if(error.type && errors[error.type]){
            error = new errors[error.type]({
                ...error,
                message: error.message,
                errorDetails: error.details
            })
        }
        return log.error(error)
    }
    log.error(error)
})