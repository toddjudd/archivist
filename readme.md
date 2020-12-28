# Manage the Archive

Archivist will search all sub directories of a `/target` and identify all folders named `/archive$/`

it will the generate a folder structure of `Year > Month > Day` and deposit files in the folder structure according to their created date.

## Run It

mount the directory you would like to archive, and make sure it has a `archive` sub directory. Then mount it to `/target`

`docker run --rm -v path\to\target\dir:/target archivest:latest`
