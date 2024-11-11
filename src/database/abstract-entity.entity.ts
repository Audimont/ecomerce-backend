import { PrimaryGeneratedColumn } from "typeorm";


export class AbstractEntity<T> {
    @PrimaryGeneratedColumn()
    id: number;

    constructor(partial: Partial<T>) {
        Object.assign(this, partial);
    }
}