// Interactive script to add a new championship to the database
import inquirer from 'inquirer';
import { addChampionship } from './src/lib/championships.js';

async function addNewChampionship() {
    try {
        console.log('🏁 Championship Manager - Add New Championship\n');
        
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'id',
                message: 'Enter the Championship ID:',
                validate: (input) => {
                    if (!input.trim()) {
                        return 'Championship ID is required!';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'name',
                message: 'Enter the Championship Name:',
                validate: (input) => {
                    if (!input.trim()) {
                        return 'Championship name is required!';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'description',
                message: 'Enter the Championship Description:',
                validate: (input) => {
                    if (!input.trim()) {
                        return 'Championship description is required!';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'season',
                message: 'Enter the Season:',
                default: 'Season 1',
                validate: (input) => {
                    if (!input.trim()) {
                        return 'Season is required!';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'discord_invite',
                message: 'Enter Discord Invite URL (optional):',
                default: ''
            },
            {
                type: 'input',
                name: 'website',
                message: 'Enter Website URL (optional):',
                default: ''
            },
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Do you want to add this championship to the database?',
                default: true
            }
        ]);

        if (!answers.confirm) {
            console.log('❌ Operation cancelled.');
            return;
        }

        const newChampionship = {
            id: answers.id.trim(),
            name: answers.name.trim(),
            description: answers.description.trim(),
            season: answers.season.trim(),
            discord_invite: answers.discord_invite.trim() || null,
            website: answers.website.trim() || null
        };

        console.log('\n⏳ Adding championship to database...');
        const result = await addChampionship(newChampionship);
        
        console.log('✅ Championship added successfully!');
        console.log('📊 Details:', {
            id: result.id,
            changes: result.changes
        });
        
        console.log('\n🌐 You can now access this championship at:');
        console.log(`   http://localhost:5173/events-and-leagues/${newChampionship.id}`);
        
    } catch (error) {
        console.error('❌ Error adding championship:', error.message);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n👋 Goodbye!');
    process.exit(0);
});

addNewChampionship();
