// TODO exclude librarian if no outsiders exist
// TODO maybe genericize first night demon stuff if helps for advanced roles
// TODO add drunk
// TODO add baron
// TODO add reminder text per-role (e.g. if the virgin is nominated by a townsfolk, and virgin is not drunk|poisoned, that townsfolk is executed)

enum Townsfolk {
    Washerwoman = 'Washerwoman',
    Librarian = 'Librarian',
    Investigator = 'Investigator',
    Chef = 'Chef',
    Empath = 'Empath',
    FortuneTeller = 'Fortune Teller',
    Undertaker = 'Undertaker',
    Monk = 'Monk',
    Ravenkeeper = 'Raven keeper',
    Virgin = 'Virgin',
    Slayer = 'Slayer',
    Soldier = 'Soldier',
    Mayor = 'Mayor',
}

interface NightInstruction {
    role: Role;
    instructionText: string;
    isFirstNightOnly?: true;
    isSubsequentNightsOnly?: true;
}

enum Outsider {
    Butler = 'Butler',
    // Drunk = 'Drunk', // TODO not yet supported
    Recluse = 'Recluse',
    Saint = 'Saint',
}

enum Minion {
    Poisoner = 'Poisoner',
    Spy = 'Spy',
    ScarletWoman = 'Scarlet Woman',
    // Baron = 'Baron', // TODO not yet supported
}

enum Demon {
    Imp = 'Imp',
}

type RoleType = 'townsfolk' | 'outsider' | 'minion' | 'demon';
type Role = Townsfolk | Outsider | Minion | Demon;

const NightInstruction: NightInstruction[] = [
    {
        role: Minion.Spy,
        instructionText:
            'Because you have the spy, write down which characters you told the demon are not in play. Make sure you include this information when you give the spy your notes.',
        isFirstNightOnly: true,
    },
    {
        role: Townsfolk.Empath,
        instructionText: 'Choose a red herring for the empath.',
        isFirstNightOnly: true,
    },
    {
        role: Minion.Poisoner,
        instructionText: 'Ask NAME to specify a player to poison.',
    },
    {
        role: Townsfolk.Monk,
        instructionText:
            'Ask NAME to specify a player to protect from the demon (if poisoned|drunk, their choice is ignored).',
    },
    {
        role: Minion.Spy,
        instructionText:
            'Give NAME the list of players, their roles, which three characters the demon was told about, and all statuses like red herring or poisoned.',
    },
    {
        role: Minion.ScarletWoman,
        instructionText:
            'If the Scarlet Woman (NAME) became the Imp today, tell them they are now the imp.',
        isSubsequentNightsOnly: true,
    },
    {
        role: Demon.Imp,
        instructionText:
            'Ask NAME to choose a player. That player dies unless their are the soldier or protected by the monk.',
        isSubsequentNightsOnly: true,
    },
    {
        role: Townsfolk.Ravenkeeper,
        instructionText:
            'If the ravenkeeper (NAME) was killed by the demon tonight, ask NAME to choose a player. Tell that players character role (if poisoned|drunk, tell incorrect role).',
        isSubsequentNightsOnly: true,
    },
    {
        role: Townsfolk.Undertaker,
        instructionText:
            'If a player was executed yesterday, tell the undertaker (NAME) their role (if poisoned|drunk, tell incorrect role).',
        isSubsequentNightsOnly: true,
    },
    {
        role: Townsfolk.Washerwoman,
        instructionText:
            'Tell NAME a townsfolk and two players - one of whom is that townsfolk (if poisoned|drunk, tell two incorrect players).',
        isFirstNightOnly: true,
    },
    {
        role: Townsfolk.Librarian,
        instructionText:
            'Tell NAME an outsider and two players - one of whom is that outsider (if poisoned|drunk, tell two incorrect players).',
        isFirstNightOnly: true,
    },
    {
        role: Townsfolk.Investigator,
        instructionText:
            'Tell NAME a minion and two players - one of whom is that minion (if poisoned|drunk, tell two incorrect players).',
        isFirstNightOnly: true,
    },
    {
        role: Townsfolk.Chef,
        instructionText:
            'Tell NAME the number of evil pairs sitting next to each other (if poisoned|drunk, lie).',
        isFirstNightOnly: true,
    },
    {
        role: Townsfolk.Empath,
        instructionText:
            'Tell NAME the number of alive evil players sitting next to them (if poisoned|drunk, lie).',
    },
    {
        role: Townsfolk.FortuneTeller,
        instructionText:
            'Ask NAME to choose two players. Say yes if either is the demon (if poisoned|drunk, lie).',
    },
    {
        role: Outsider.Butler,
        instructionText:
            'Ask NAME to choose a player. This is their master. Their vote counts for 0 unless their master (unless poisoned).',
    },
];

interface RoleDistribution {
    outsider?: number;
    minion: number;
    demon: number;
}

interface Script {
    playerSeating: string[];
    playerRoles: {
        [player: string]: Role;
    };
    firstNightInstructions: string[];
    otherNightsInstructions: string[];
}

const roleDistributionByPlayerCount: { [count: number]: RoleDistribution } = {
    5: {
        minion: 1,
        demon: 1,
    },
    6: {
        outsider: 1,
        minion: 1,
        demon: 1,
    },
    7: {
        minion: 1,
        demon: 1,
    },
    8: {
        outsider: 1,
        minion: 1,
        demon: 1,
    },
    9: {
        outsider: 2,
        minion: 1,
        demon: 1,
    },
    10: {
        minion: 2,
        demon: 1,
    },
};

const getRandomRoles = (count: number, roles: Role[]): Role[] =>
    shuffle([...roles]).slice(0, count);

const shuffle = <T>(array: T[]): T[] => {
    let currentIndex = array.length;
    let temporaryValue: T;
    let randomIndex: number;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

const getMinionPlayerNames = (
    playersByRole: { [role in Role]?: string },
): string[] => {
    const names: string[] = [];
    Object.values(Minion).forEach((role) => {
        const player = playersByRole[role];
        if (!player) return;
        names.push(player);
    });
    return names;
};

const makeInstruction = (
    role: Role,
    player: string,
    instructionText: string,
): string => `${role} - ${instructionText.replace('NAME', player)}`;

const getCharactersNotInPlay = (playerRoles: {
    [player: string]: Role;
}): Role[] => {
    const roleSet = new Set<Role>(Object.values(playerRoles));
    return [...Object.values(Townsfolk), ...Object.values(Outsider)].reduce<
        Role[]
    >((memo, role) => {
        if (roleSet.has(role)) return memo;
        memo.push(role);
        return memo;
    }, []);
};

const makeNightInstructions = (playerRoles: {
    [player: string]: Role;
}): {
    firstNightInstructions: string[];
    otherNightsInstructions: string[];
} => {
    const playersByRole = Object.keys(playerRoles).reduce<
        { [role in Role]?: string }
    >((memo, player) => {
        memo[playerRoles[player]] = player;
        return memo;
    }, {});

    const minions = getMinionPlayerNames(playersByRole);
    const demon = playersByRole[Demon.Imp];
    const charactersNotInPlay = getCharactersNotInPlay(playerRoles);

    const firstNightInstructions = [
        ...minions.map<string>(
            (player) => `Tell ${player} that ${demon} is the demon`,
        ),
        `Tell the demon (${demon}) their minions: ${minions.join(', ')}`,
        `Tell the demon (${demon}) that three of these characters are not in play: ${charactersNotInPlay.join(
            ', ',
        )}`,
        ...NightInstruction.reduce<string[]>((memo, instruction) => {
            const player = playersByRole[instruction.role];
            if (instruction.isSubsequentNightsOnly || !player) return memo;
            memo.push(
                makeInstruction(
                    instruction.role,
                    player,
                    instruction.instructionText,
                ),
            );
            return memo;
        }, []),
    ];

    const otherNightsInstructions: string[] = NightInstruction.reduce<string[]>(
        (memo, instruction) => {
            const player = playersByRole[instruction.role];
            if (instruction.isFirstNightOnly || !player) return memo;
            memo.push(
                makeInstruction(
                    instruction.role,
                    player,
                    instruction.instructionText,
                ),
            );
            return memo;
        },
        [],
    );

    return { firstNightInstructions, otherNightsInstructions };
};

const makeScript = (players: string[]): Script => {
    const roleDistribution = roleDistributionByPlayerCount[players.length];
    if (!roleDistribution) throw new Error('Unsupported number of players');

    const playerSeating = shuffle(players);
    const outsiderCount = roleDistribution.outsider || 0;
    const townsfolkCount =
        players.length -
        roleDistribution.demon -
        roleDistribution.minion -
        outsiderCount;

    const roles: Role[] = shuffle([
        ...getRandomRoles(roleDistribution.demon, Object.values(Demon)),
        ...getRandomRoles(roleDistribution.minion, Object.values(Minion)),
        ...getRandomRoles(
            roleDistribution.outsider || 0,
            Object.values(Outsider),
        ),
        ...getRandomRoles(townsfolkCount, Object.values(Townsfolk)),
    ]);

    const playerRoles = playerSeating.reduce<{ [player: string]: Role }>(
        (memo, player, i) => {
            memo[player] = roles[i];
            return memo;
        },
        {},
    );

    const {
        firstNightInstructions,
        otherNightsInstructions,
    } = makeNightInstructions(playerRoles);

    return {
        playerSeating,
        playerRoles,
        firstNightInstructions,
        otherNightsInstructions,
    };
};

const testNames = ['Arilyn', 'Alex', 'Dash', 'Naomi', 'Isobel'];

const printHeader = (text: string): void => {
    console.log(`\n---- ${text}`);
};

const printSubheader = (text: string): void => {
    console.log(`\n\n-- ${text}`);
};

const printText = (text: string): void => {
    console.log(`   ${text}`);
};

const printScript = (script: Script): void => {
    printHeader(`Trouble Brewing for ${script.playerSeating.length} players`);
    printSubheader(
        'Player Seating (without roles - copy this to the players):',
    );
    script.playerSeating.forEach((player) => printText(player));

    printSubheader('Player Seating (with roles - keep this secret):');
    script.playerSeating.forEach((player) =>
        printText(`${player} (${script.playerRoles[player]})`),
    );

    printSubheader('First Night Instructions:');
    script.firstNightInstructions.forEach((instruction, i) =>
        printText(`${i + 1}) ${instruction}`),
    );

    printSubheader('Other Night Instructions:');
    script.otherNightsInstructions.forEach((instruction, i) =>
        printText(`${i + 1}) ${instruction}`),
    );
};

const testScript = makeScript(['Arilyn', 'Alex', 'Dash', 'Naomi', 'Isobel']);
printScript(testScript);
