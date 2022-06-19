# ghostify
ghostify is a ghost theme deployer that allow you to deploy your ghost the localy and test it without restarting your ghost server

## installation
```sh
$ npm install -g ghostify
```
## usage
```sh
$ ghostify <config file or theme path> [options]
```
you can use it differently with these optionals options
* `-c`, `--config` `filename` : the ghostify.json config containing your admin api key and url and others theme informations
* `-q`, `--quiet` : do not output the deployment logs. Default is false
* `-p`, `--prserve` : whever to keep the zip theme after deploy. Default is false
* `-h`, `--help` : print the help and exit

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
$ ghostify ghostify -c <file path>
```
### specify the theme base path containing the config file and package.json
```sh
$ ghostify <theme path>
```
