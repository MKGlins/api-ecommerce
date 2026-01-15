import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { PaginationDto } from "./dto/pagination.dto";
import { take } from "rxjs";

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto) {
    // INSERT INTO produtos (nome, descrição, ...) VALUES (...)
    const produto = this.repo.create(createProductDto);
    return this.repo.save(produto);
  }

  async findAll(paginationDto: PaginationDto) {
    // SELECT * FROM produtos
    const { limit, page } = paginationDto;
    const skip = (page - 1 ) * limit;

    const [produtos, total] = await this.repo.findAndCount({
      take: limit,
      skip: skip,
    })

    return {
      data: produtos,
      count: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: number) {
    // SELECT * FROM produtos WHERE id = {id} LIMIT 1
    return this.repo.findOneBy({id})
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    //UPDATE produtos SET nome = '...', preco = ... WHERE id = {id}
    return this.repo.update(id, updateProductDto);
  }

    remove(id: number) {
      // DELETE FROM produtos WHERE id = {id}
      return this.repo.softDelete(id);
    }

    async findTrash() {
      return this.repo.createQueryBuilder('product')
      .withDeleted()
      .where('product.deletedAt IS NOT NULL')
      .getMany();
    }

    async restore(id: number) {
      return this.repo.restore(id);
    }
}