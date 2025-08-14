using System;
using System.Collections.Generic;

namespace SEP490_BE.Entities
{
    public partial class TransactionDetail
    {
        public Guid Id { get; set; }
        public string TransactionId { get; set; } = null!;
        public string? ParentTransactionId { get; set; }
        public int? QuantityProvided { get; set; }

        public virtual Transaction? ParentTransaction { get; set; }
        public virtual Transaction Transaction { get; set; } = null!;
    }
}
