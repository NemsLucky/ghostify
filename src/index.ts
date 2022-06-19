// @ts-ignore
import GhostAdminApi from "@tryghost/admin-api"
// @ts-ignore
import log from "@tryghost/logging"
import { resolve } from "path"
import AdmZip from "adm-zip"
import { existsSync, statSync } from "fs"
import { execSync } from "child_process"
import { platform } from "os"

export interface Options {
    apiUrl: string,
    apiKey: string,
    basePath: string,
    themeName: string,
    excludes?: string | string[],
    preserve?: boolean,
    debug?: boolean
}

function rmFile(fpath: string){
    if(existsSync(fpath)){
        let isDir = statSync(fpath).isDirectory()
        let command = ""
        if(platform() === "win32"){
            command += (isDir? "rmdir /S /Q " : "del /Q ")+fpath
            
        }else {
            command += `rm -r ${fpath}`
        }
        
        let res = execSync(command).toString()
    }
}

export default async function deploy(options: Options) {
    let { apiKey, apiUrl, basePath, themeName, excludes, preserve, debug } = options
    let zipPath = resolve(basePath, `${themeName}.zip`)
    let hasError = false

    excludes = Array.isArray(excludes) ? excludes : (excludes || "").trim().split(" ");
    excludes = excludes.filter((v) => !!v.trim().length);
    excludes.includes("ghostify.json") || excludes.push("ghostify.json")
    
    excludes = excludes.map((rule) =>
        rule.trim().replace(/[*.]/g, (m) => (m === "*" ? ".*" : "\\."))
    ).join("|");

    let excludeReg = new RegExp(
        "(.*?(\\.(git.*|zip|(routes|redirects)\\.yaml|redirects\\.json)))|(yarn|npm|node_modules).*" +
        (excludes.length ? "|" + excludes : ""),
        "gi"
    );

    // console.log(excludeReg)
    // return 

    try {
        let zip = new AdmZip()
        zip.addLocalFolder(basePath, undefined, entry=>{
            let excl = !!entry.match(excludeReg)
            if(debug && !excl) log.info("adding entry "+entry)
            return !excl
        })
        zip.writeZip(zipPath, (err)=>{
            if(err){
                hasError = true
                log.error(err)
            }
        })

        if(hasError) {
            return Promise.reject({error: "zip ended with errors"})
        }

        const api = new GhostAdminApi({
            url: apiUrl,
            key: apiKey,
            version: "v5.0"
        })

        return await api.themes.upload({file: zipPath})
        
    } catch (error) {
        return Promise.reject(error)
    } finally {
        if(!preserve) rmFile(zipPath)
    }

}