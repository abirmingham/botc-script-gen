import React, { FC, useState, useCallback, useMemo } from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';
import {
    Grid,
    TextField,
    FormControl,
    FormGroup,
    FormLabel,
    makeStyles,
    ThemeProvider,
    Theme,
    Checkbox,
    FormControlLabel,
    Paper,
    Container,
    Button,
    ListItemText,
    List,
    ListItem,
    ListItemIcon,
} from '@material-ui/core';
import {
    Minion,
    Outsider,
    Townsfolk,
    SeedableRole,
    Script,
    makeScript,
} from './core';
import { without, capitalize } from 'lodash';

const roleOptions = [
    ...Object.values(Townsfolk),
    ...Object.values(Outsider),
    ...Object.values(Minion),
];

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    title: {
        fontSize: 22,
    },
    paper: {
        padding: theme.spacing(1),
    },
    playersInput: {
        fontFamily: 'monospace',
        minWidth: 300,
    },
    roleRow: {
        marginLeft: theme.spacing(2),
    },
    roleOption: {
        display: 'inline-block',
        padding: theme.spacing(1),
    },
}));

const defaultPlayers = [
    'Alex',
    'Arilyn',
    'Kristy',
    'Brittany',
    'Doug',
    'Isobel',
    'Naomi',
    'Dash',
    'Nika',
];

export const App: FC = () => {
    const classes = useStyles();

    const [playersText, setPlayersText] = useState<string>(() =>
        defaultPlayers.join('\n'),
    );

    const [seededRoles, setSeededRoles] = useState<Set<SeedableRole>>(
        () => new Set(),
    );

    const [script, setScript] = useState<Script | null>(null);

    const generateScript = useCallback(() => {
        const players = playersText
            .split('\n')
            .map((x) => capitalize(x.trim()));
        setScript(makeScript(players, Array.from(seededRoles)));
    }, [playersText, seededRoles]);

    const maxNameLength = useMemo(
        () =>
            script
                ? script.playerSeating.reduce(
                      (memo, player) => Math.max(memo, player.length),
                      0,
                  )
                : 0,
        [script],
    );

    return (
        <div className={classes.root}>
            <Container>
                <Grid
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="stretch"
                    spacing={4}
                >
                    {/* INPUT */}
                    <Grid item>
                        <Paper className={classes.paper}>
                            <div className={classes.title}>Configuration</div>
                            <Grid
                                container
                                direction="column"
                                justify="flex-start"
                                alignItems="flex-start"
                                spacing={2}
                            >
                                <Grid item>
                                    <TextField
                                        inputProps={{
                                            className: classes.playersInput,
                                        }}
                                        label={'Players (one per line)'}
                                        value={playersText}
                                        onChange={(e) =>
                                            setPlayersText(e.target.value)
                                        }
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        multiline
                                    ></TextField>
                                </Grid>
                                <Grid item>
                                    <SeededRoleInput
                                        label={'Townsfolk (optional)'}
                                        options={Object.values(Townsfolk)}
                                        value={seededRoles}
                                        onChange={setSeededRoles}
                                    />
                                </Grid>
                                <Grid item>
                                    <SeededRoleInput
                                        label={'Outsiders (optional)'}
                                        options={Object.values(Outsider)}
                                        value={seededRoles}
                                        onChange={setSeededRoles}
                                    />
                                </Grid>
                                <Grid item>
                                    <SeededRoleInput
                                        label={'Minions (optional)'}
                                        options={Object.values(Minion)}
                                        value={seededRoles}
                                        onChange={setSeededRoles}
                                    />
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={generateScript}
                                    >
                                        Generate Script
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    {/* SEATING */}
                    {script && (
                        <Grid item>
                            <Paper className={classes.paper}>
                                <div className={classes.title}>Seating</div>
                                <TextField
                                    inputProps={{
                                        className: classes.playersInput,
                                    }}
                                    disabled
                                    multiline
                                    variant="outlined"
                                    margin="normal"
                                    value={script.playerSeating.join(`\n`)}
                                />
                            </Paper>
                        </Grid>
                    )}
                    {/* SEATING WITH ROLES */}
                    {script && (
                        <Grid item>
                            <Paper className={classes.paper}>
                                <div className={classes.title}>
                                    Seating With Roles
                                </div>
                                <TextField
                                    inputProps={{
                                        className: classes.playersInput,
                                    }}
                                    disabled
                                    multiline
                                    variant="outlined"
                                    margin="normal"
                                    value={script.playerSeating
                                        .map(
                                            (p) =>
                                                `${printWide(
                                                    p,
                                                    maxNameLength,
                                                )} - ${script.playerRoles[p]}`,
                                        )
                                        .join(`\n`)}
                                />
                            </Paper>
                        </Grid>
                    )}
                    {/* FIRST NIGHT INSTRUCTIONS */}
                    {script && (
                        <Grid item>
                            <InstructionsPaper
                                label="First Night"
                                instructions={script.firstNightInstructions}
                            />
                        </Grid>
                    )}
                    {/* SUBSEQUENT NIGHT INSTRUCTIONS */}
                    {script && (
                        <Grid item>
                            <InstructionsPaper
                                label="Subsequent Nights"
                                instructions={script.otherNightsInstructions}
                            />
                        </Grid>
                    )}
                </Grid>
            </Container>
        </div>
    );
};

const SeededRoleInput: FC<{
    label: string;
    options: SeedableRole[];
    value: Set<SeedableRole>;
    onChange: (val: Set<SeedableRole>) => void;
}> = ({ label, options, value, onChange }) => {
    const classes = useStyles();
    return (
        <div>
            <FormLabel>{label}</FormLabel>
            <FormGroup row className={classes.roleRow}>
                {options.map((option) => (
                    <FormControlLabel
                        key={option}
                        control={
                            <Checkbox
                                className={classes.roleOption}
                                checked={value.has(option)}
                                onChange={(e) => {
                                    if (value.has(option)) {
                                        onChange(
                                            new Set(
                                                without(
                                                    Array.from(value),
                                                    option,
                                                ),
                                            ),
                                        );
                                        return;
                                    }
                                    onChange(
                                        new Set([...Array.from(value), option]),
                                    );
                                }}
                                name={option}
                            />
                        }
                        label={
                            <span className={classes.roleOption}>{option}</span>
                        }
                    />
                ))}
            </FormGroup>
        </div>
    );
};

const InstructionsPaper: FC<{ label: string; instructions: string[] }> = ({
    label,
    instructions,
}) => {
    const classes = useStyles();
    return (
        <Paper className={classes.paper}>
            <div className={classes.title}>{label}</div>
            <List>
                {instructions.map((instruction, i) => (
                    <ListItem key={instruction} dense>
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                tabIndex={-1}
                                disableRipple
                            />
                        </ListItemIcon>
                        <ListItemText primary={instruction} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

const printWide = (name: string, length: number): string => {
    const nameLength = name.length;
    let padding = '';
    for (let i = 0; i < length - nameLength; i++) {
        padding += ' ';
    }
    return name + padding;
};
