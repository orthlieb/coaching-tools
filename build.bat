echo Compiling SCSS
set "sass_dir=scss"
set "output_dir=styles"

for %%f in ("%sass_dir%\*.scss") do (
    echo Compiling %%f
    sass "%%f" "%output_dir%\%%~nf.css"
)

echo Building Docs
rmdir -Path ".\docs" -Recurse -Force
jsdoc -c jsdoc.json .