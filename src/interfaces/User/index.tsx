export interface User {
    uid: string
    first_name: string
    last_name: string
    username: string
    age: number
    salary: string
}

export interface UserState {
    objects: any[],
    setInitialData: () => void;
    addUser: (user: User) => void;
    removeUser: (id: string) => void;
}
