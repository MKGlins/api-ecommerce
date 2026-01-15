import { text } from "stream/consumers";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity ({ name: 'produtos'}) //nome da tabela no banco
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100})
    nome: string;

    @Column('text', { nullable:true })
    descricao: string;

    // Decimal é crucial para dinheiro para evitar erros de arredondamento
    @Column('decimal', { precision:10, scale:2})
    preco: number;

    @Column('int')
    estoque: number;

    @CreateDateColumn({ name: 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at'})
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at'})
    deletedAt: Date;

    @Column({ nullable: true})
    foto: string;
}