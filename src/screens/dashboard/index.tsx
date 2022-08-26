import { useEffect, useState } from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import axios from 'axios';

import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import MUIDataTable from "mui-datatables";
import Button from '@mui/material/Button';

import { UserState, User } from '../../interfaces/User';


const columns = ["first_name", "last_name", "username", "age", "salary"];

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}


const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

const mdTheme = createTheme();

function DashboardContent() {
    const [open, setOpen] = useState(false);
    const toggleDrawer = () => { setOpen(!open); };

    const url = "https://random-data-api.com/api/v2/users";

    const useUserStore = create<UserState>()(
        devtools(
            persist(
                (set) => ({
                    objects: [],
                    setInitialData: async () => {
                        const response = await axios.get(`${url}?size=50`)
                        set({ objects: formatData(response.data) })
                    },
                    addUser: (data) =>
                        set((state) => ({
                            objects: [
                                data,
                                ...state.objects
                            ]
                        })),
                    removeUser: (uid) =>
                        set((state) => ({
                            objects: state.objects.filter((user) => user.uid !== uid),
                        })),
                }),
                {
                    name: 'user-storage',
                }
            )
        )
    )

    const setUserStore = useUserStore((state) => state.setInitialData)
    const setUser = useUserStore((state) => state.addUser)
    const deleteUser = useUserStore((state) => state.removeUser)
    const data = useUserStore((state) => state.objects)

    const createNewUser = async () => {
        const response = await axios.get(`${url}`)
        setUser(formatUser(response.data))
    }

    const formatData = (data: any) => {
        const users: User[] = [];
        data.forEach((item: any) => users.push(formatUser(item)))
        return users;
    }

    const formatUser = (item: any) => {
        const today: Date = new Date();
        const uid: string = item.uid
        const first_name: string = item.first_name
        const last_name: string = item.last_name
        const username: string = item.username
        const birthdate = new Date(item.date_of_birth);
        const age = dateDiffInYears(birthdate, today);
        const salary = generateSalary();

        const user: User = {
            uid,
            first_name,
            last_name,
            username,
            age,
            salary,
        }
        return user;
    }

    const generateSalary = () => {
        let rand = Math.random() * 10000;
        return `R$ ${Math.floor(rand)},00`;
    }

    const dateDiffInYears = (a: Date, b: Date) => {
        const yearA = a.getFullYear();
        const monthA = a.getMonth();
        const dayA = a.getDay();

        const yearB = b.getFullYear();
        const monthB = b.getMonth();
        const dayB = b.getDay();

        if (yearB <= yearA) {
            return 0;
        }

        if (monthB < monthA) {
            return Math.floor(yearB - yearA) - 1;
        }
        if (monthB == monthA && dayB < dayA) {
            return Math.floor(yearB - yearA) - 1;
        }
        return Math.floor(yearB - yearA);
    }


    const options = {
        onRowsDelete: (e: any) => {
            e.data.forEach((item: any) => {
                deleteUser(data[item.dataIndex].uid)
            })
        },
    }

    useEffect(() => {
        setUserStore();
    }, [])

    return (
        <ThemeProvider theme={mdTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="absolute" open={open}>
                    <Toolbar
                        sx={{
                            pr: '24px', // keep right padding when drawer closed
                        }}
                    >
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            Dashboard
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <Toolbar
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            px: [1],
                        }}
                    >
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                </Drawer>
                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        minHeight: '100vh',
                        height: '100%',
                    }}
                >
                    <Toolbar />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                        <Grid container spacing={3}>
                            {/* Recent Orders */}
                            <Grid item xs={12}>
                                <Grid item xs={12} sx={{ mb: 5 }}>
                                    <h1 style={{ textAlign: 'center' }}>User Details</h1>
                                </Grid>

                                <Grid item xs={2} sx={{ mb: 5 }}>
                                    <Button onClick={() => createNewUser()} variant="contained" size="large">ADD USER</Button>
                                </Grid>
                                <Paper sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                                    <MUIDataTable
                                        title={"User List"}
                                        data={data}
                                        columns={columns}
                                        options={options}
                                    />

                                </Paper>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default function Dashboard() {
    return <DashboardContent />;
}
