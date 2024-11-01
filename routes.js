"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const auth_controller_1 = tslib_1.__importDefault(require("./app/auth/auth.controller"));
const auth0_controller_1 = tslib_1.__importDefault(require("./app/auth0/auth0.controller"));
const admin_controller_1 = tslib_1.__importDefault(require("./app/admin/admin.controller"));
const dashboard_controller_1 = require("./app/dashboard/dashboard.controller");
const expenses_controller_1 = require("./app/expenses/expenses.controller");
const settings_controller_1 = tslib_1.__importDefault(require("./app/settings/settings.controller"));
const auth_service_instance_1 = tslib_1.__importDefault(require("./app/auth/services/auth.service.instance"));
const in_memory_budget_repository_1 = require("./app/dashboard/in-memory-budget.repository");
const in_memory_expenses_repository_1 = require("./app/expenses/in-memory-expenses.repository");
const dashboardCtrl = new dashboard_controller_1.DashboardController(new in_memory_budget_repository_1.InMemoryBudgetRepository());
const expensesCtrl = new expenses_controller_1.ExpensesController(new in_memory_expenses_repository_1.InMemoryExpensesRepository());
const api = (0, express_1.Router)()
    .use(dashboardCtrl.getRouter())
    .use(expensesCtrl.getRouter())
    .use(settings_controller_1.default);
exports.default = (0, express_1.Router)()
    .use('/api/auth', auth_controller_1.default)
    .use('/api/auth0', auth0_controller_1.default)
    .use('/api/admin', auth_service_instance_1.default.authenticate(), admin_controller_1.default)
    .use('/api', auth_service_instance_1.default.authenticate(), api);
