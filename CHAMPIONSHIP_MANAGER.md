# Championship Manager

This tool allows you to add new championships to the database through an interactive terminal interface.

## Usage

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Run the championship manager**:

   **For Node.js/npm:**
   ```bash
   npm run add-championship
   ```
   
   **For Bun (recommended):**
   ```bash
   bun add_championship_bun.js
   ```
   
   **For TypeScript with tsx:**
   ```bash
   npx tsx add_championship.ts
   ```

3. **Follow the prompts**:
   - Enter the Championship ID (get this from the API endpoint)
   - Enter the Championship Name (what will be displayed)
   - Enter the Description (brief description of the championship)
   - Enter the Season (e.g., "Season 1", "2024", etc.)
   - Enter Discord Invite URL (optional)
   - Enter Website URL (optional)
   - Confirm to add the championship

## Example

```bash
$ bun add_championship_bun.js

🏁 Championship Manager - Add New Championship

? Enter the Championship ID: f1-2024-abc123
? Enter the Championship Name: Formula 1 Championship 2024
? Enter the Championship Description: Formula 1 championship featuring modern F1 cars
? Enter the Season: Season 1
? Enter Discord Invite URL (optional): https://discord.gg/your-invite
? Enter Website URL (optional): https://your-website.com
? Do you want to add this championship to the database? Yes

⏳ Adding championship to database...
✅ Championship added successfully!
📊 Details: { id: 'f1-2024-abc123', changes: 1 }

🌐 You can now access this championship at:
   http://localhost:5173/events-and-leagues/f1-2024-abc123
```

## Getting Championship ID

To get the Championship ID, you need to know the API endpoint. The ID is the part after `/championship/` in the URL:

```
http://138.201.226.34:8092/championship/YOUR_CHAMPIONSHIP_ID/standings.json
```

For example, if the URL is:
```
http://138.201.226.34:8092/championship/f1-2024-abc123/standings.json
```

Then the Championship ID is: `f1-2024-abc123`

## Features

- ✅ Interactive prompts with validation
- ✅ Optional fields for Discord and Website
- ✅ Confirmation before adding
- ✅ Success feedback with access URL
- ✅ Graceful error handling
- ✅ Ctrl+C to cancel at any time
