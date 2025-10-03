import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  async findAll(): Promise<Item[]> {
    return this.itemsRepository.find();
  }

  async findOne(id: number): Promise<Item | null> {
    return this.itemsRepository.findOneBy({ id });
  }

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const item = this.itemsRepository.create(createItemDto);
    return this.itemsRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    await this.itemsRepository.delete(id);
  }
}
