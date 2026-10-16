using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Service.DTO;
using Service.Entities;
using Service.Services;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController(IOrderService orderService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<OrderDto>>> GetAllOrders([FromQuery] OrderQueryParameters query, CancellationToken cancellationToken)
        {
            PagedResult<OrderDto> orders = await orderService.GetAllOrdersAsync(query);
            return Ok(orders);
        }

        [HttpGet("id:guid")]
        public async Task<ActionResult<OrderDto>> GetOrder(Guid id, CancellationToken cancellationToken)
        {
            var order = await orderService.GetOrderAsync(id);

            return order == null ? NotFound() : Ok(order);
        }

        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateNewOrder(CreateOrderDTO order, CancellationToken cancellationToken)
        {
            var newOrder = await orderService.CreateNewOrderAsync(order);

            return CreatedAtAction(nameof(GetOrder), new {id = newOrder.Id}, newOrder);
        }

        [HttpDelete("id:guid")]
        public async Task<ActionResult> DeleteOrder(Guid id, CancellationToken cancellationToken)
        {
            var delete = await orderService.DeleteOrderAsync(id);

            return delete == false ? NotFound() : NoContent();
        }

        [HttpPut("id:guid")]
        public async Task<ActionResult<OrderDto>> UpdateOrder(Guid id, UpdateOrderDTO order, CancellationToken cancellationToken)
        {
            var newOrder = await orderService.UpdateOrderAsync(id, order);

            return newOrder == null ? NotFound() : Ok(newOrder);
        }
    }
}
