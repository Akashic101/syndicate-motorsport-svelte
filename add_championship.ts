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
                type: 'input',
                name: 'image_path',
                message: 'Enter Image Path (e.g., /images/championship-logo.png) (optional):',
                default: ''
            },
            {
                type: 'input',
                name: 'start_date',
                message: 'Enter Start Date (YYYY-MM-DD) (optional):',
                default: ''
            },
            {
                type: 'input',
                name: 'end_date',
                message: 'Enter End Date (YYYY-MM-DD) (optional):',
                default: ''
            },
            {
                type: 'number',
                name: 'round_count',
                message: 'Enter Number of Rounds (optional):',
                default: 0
            },
        {
            type: 'list',
            name: 'status',
            message: 'Select Championship Status:',
            choices: [
                { name: 'Planned', value: 'planned' },
                { name: 'Running', value: 'running' },
                { name: 'Finished', value: 'finished' }
            ],
            default: 'planned'
        },
        {
            type: 'input',
            name: 'sign_up_link',
            message: 'Enter Sign-up Link (optional):',
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
            website: answers.website.trim() || null,
            image_path: answers.image_path.trim() || null,
            start_date: answers.start_date.trim() || null,
            end_date: answers.end_date.trim() || null,
            round_count: answers.round_count || 0,
            status: answers.status || 'planned',
            sign_up_link: answers.sign_up_link.trim() || null
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
