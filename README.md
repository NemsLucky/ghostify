# ghostify
ghostify is a ghost theme deployer that allow you to deploy your ghost theme localy and test it without restarting your ghost server

## installation
```sh
$ npm install -g ghostify
```
## usage
```sh
$ ghostify <config file or theme path> [options]
```
you can use it differently with these optionals options
* `-c`, `--config` `filename` : the ghostify.js or ghostify.json config containing your admin api key and url and others theme informations
* `-q`, `--quiet` : do not output the deployment logs. Default is false
* `-p`, `--preserve` : whever to keep the zip theme after deploy. Default is false
* `-h`, `--help` : print the help and exit

the config file should export an object with the following properties:
* `apiUrl: string` the ghost admin api url
* `apiKey: string` the ghost admin api key
* `themeName?: string` the desired heme name (can be omited if the config file is in the same directory  than package.json)
* `excludes?: string | Array<string>` the optional list of files to exclude from deployed theme, can be an space separed string or an array of string like `*test demo.hbs *hidden*`
* `preserve?: boolean` an optional property to save the zipped the after deployment and can be overrided by -p cli option, default is false 

## Examples
### use in theme base directory
```sh
$ ghostify
```
### specify the config file
```sh
$ ghostify <config file path>
```
or
```sh
$ ghostify -c <file path>
```
### specify the theme base path containing the config file and package.json
```sh
$ ghostify <theme path>
```
