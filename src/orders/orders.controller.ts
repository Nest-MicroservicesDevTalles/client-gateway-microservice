import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs';

import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto';
import { NATS_SERVICE, ORDER_SERVICE } from 'src/configs';
import { PaginationDto } from 'src/common';

@Controller('orders')
export class OrdersController {

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) { }

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send('createOrder', createOrderDto);
  }

  @Get()
  public async findAllOrder(@Query() orderPaginationDto: OrderPaginationDto) {

    try {
      
      const orders = await firstValueFrom(this.client.send('findAllOrders', orderPaginationDto));

      return orders

    } catch (error) {

      throw new RpcException(error);
      
    }
    
  }

  @Get('id/:id')
  public async findOneOrder(@Param('id', ParseUUIDPipe) id: string) {

    try {

      const order = await firstValueFrom(this.client.send('findOneOrder', { id }));

      return order;

    } catch (error) {

      throw new RpcException(error);

    }

  }

  @Get(':status')
  public async findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto
  ) {

    try {

      return await firstValueFrom(this.client.send('findAllOrders', {
        ...paginationDto,
        status: statusDto.status
      }));

    } catch (error) {

      throw new RpcException(error);

    }

  }

  @Patch(':id')
  public async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: StatusDto) {

    try {

      return await firstValueFrom(this.client.send('changeOrderStatus', {
        id,
        status: statusDto.status
      }));

    } catch (error) {

      throw new RpcException(error);

    }

  }

}
