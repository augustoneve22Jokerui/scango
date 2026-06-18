/**
 * Middleware para controle de acesso baseado em funções (Roles)
 * @param {Array|String} roles - Uma ou mais roles permitidas para a rota
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    // 1. Verifica se o utilizador está autenticado (se o req.user existe)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilizador não autenticado ou sessão inválida.'
      });
    }

    // 2. Normaliza as roles permitidas para um array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // 3. Verifica se a role do utilizador está incluída nas roles permitidas
    // As roles comuns no ScanGo seriam: 'admin', 'partner', 'user'
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado: Você não tem permissão para realizar esta ação.'
      });
    }

    // 4. Se tiver permissão, segue para o próximo passo
    return next();
  };
};

module.exports = checkRole;
