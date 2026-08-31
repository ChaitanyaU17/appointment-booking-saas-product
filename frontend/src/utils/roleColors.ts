export const getCreatorRoleColor = (role?: string): 'primary' | 'secondary' | 'warning' | 'default' => {
  switch (role) {
    case 'Customer':
      return 'primary';
    case 'Owner/Admin':
      return 'secondary';
    default:
      return 'default';
  }
};

export const getStatusColor = (status?: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'Confirmed':
      return 'info';
    case 'Completed':
      return 'success';
    case 'Cancelled':
      return 'error';
    case 'Pending':
      return 'warning';
    default:
      return 'default';
  }
};