using System;
using System.Collections.Generic;

namespace SEP490_BE.Models
{
    public partial class LaboratoryFile
    {
        public string Id { get; set; } = null!;
        public string LaboratoryResultId { get; set; } = null!;
        public string Url { get; set; } = null!;

        public virtual LaboratoryResult LaboratoryResult { get; set; } = null!;
    }
}
