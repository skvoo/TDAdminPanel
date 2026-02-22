# Push to GitHub

The project is already committed locally. To send it to GitHub:

1. **Create a new repository** on GitHub:
   - Open https://github.com/new
   - Repository name: `TDAdminPanel` (or any name you like)
   - Leave it empty (no README, no .gitignore)
   - Create repository

2. **Add remote and push** (replace `YOUR_USERNAME` with your GitHub username):

```powershell
cd "c:\Users\sk\.cursor\projects\TDAdminPanel"
git remote add origin https://github.com/YOUR_USERNAME/TDAdminPanel.git
git branch -M main
git push -u origin main
```

If your repo already uses `master` and you prefer it:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/TDAdminPanel.git
git push -u origin master
```

After the first push you can delete this file or keep it for reference.
