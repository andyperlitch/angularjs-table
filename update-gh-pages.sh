# Updates the github pages


# Reset the branch
git checkout master
git branch -D gh-pages
git checkout -b gh-pages

# Link demo files and create templates file
for f in $(ls app); do ln -sf app/$f; done
rm -f app/scripts/templates.js
grunt html2js:dist
mv dist/templates.js app/scripts/templates.js

# Install bower stuff
bower install -f
ln -sf app/bower_components

# Stage and commit
git add app/bower_components -f
git add -A
COMMIT_ID=$(git rev-parse HEAD)
git commit -m "gh-pages update for commit: ${COMMIT_ID}"

# Push to remote
git push --set-upstream origin gh-pages -f
cp -r app/bower_components app/tmp_bower_components
git checkout master
rm -rf app/bower_components
mv app/tmp_bower_components app/bower_components
git clean -f
