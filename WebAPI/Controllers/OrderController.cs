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
        public async Task<ActionResult<List<OrderDto>>> GetAll()
        {
            List<OrderDto> orders = await orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        [HttpGet("id:guid")]
        public async Task<ActionResult<OrderDto>> getOrder(Guid id)
        {
            var order = await orderService.GetOrderAsync(id);

            return order == null ? NotFound() : Ok(order);
        }

        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateNew(CreateOrderDto order)
        {
            var newOrder = await orderService.CreateNewOrderAsync(order);

            return CreatedAtAction(nameof(getOrder), new {id = newOrder.Id}, newOrder);
        }
    }
}
