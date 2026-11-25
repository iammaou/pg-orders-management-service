using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Service.DTO;
using Service.Services;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderHistoryController(IOrderHistoryService orderHistoryService) : ControllerBase
  {
    public async Task<ActionResult<List<OrderDto>>> GetAllOrdersFromHistory([FromQuery] OrderQueryParameters query, CancellationToken cancellationToken)
        {
            PagedResult<OrderDto> orders = await orderHistoryService.GetFullOrderHistory(query);
            return Ok(orders);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<OrderDto>> GetOrderFromHistory(Guid id, CancellationToken cancellationToken)
        {
            var order = await orderHistoryService.GetOrderFromHistoryAsync(id);

            return order == null ? NotFound() : Ok(order);
        }

        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateNewOrderInHistory(CreateOrderDTO order, CancellationToken cancellationToken)
        {
            var newOrder = await orderHistoryService.CreateNewOrderInHistoryAsync(order);

            return CreatedAtAction(nameof(GetOrderFromHistory), new {id = newOrder.Id}, newOrder);
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult> DeleteOrderFromHistory(Guid id, CancellationToken cancellationToken)
        {
            var delete = await orderHistoryService.DeleteOrderFromHistoryAsync(id);

            return delete == false ? NotFound() : NoContent();
        }
  }
}
