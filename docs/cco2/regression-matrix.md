# CCO 2.0 · Matriz de regresión

| Gate                                   | Evidencia automática                          | Resultado exigido |
| -------------------------------------- | --------------------------------------------- | ----------------- |
| PERMISSION_LOSS                        | `routePermissionMatrix.test.js`, harness IAM  | 0                 |
| FUNCTION_LOSS                          | `rpcSurfaceContract.test.js` + inventario RPC | 0                 |
| ROUTE_LOSS                             | `routePermissionMatrix.test.js`               | 0                 |
| DATA_LOSS                              | migraciones aditivas + smoke SQL rollback     | 0                 |
| STOCK_SIDE_EFFECT_FROM_VISUAL_LOCATION | `putawayVisualContract.test.js`               | 0                 |
| STOCK_SIDE_EFFECT_FROM_COUNT           | `operationalContracts.test.js`                | 0                 |
| STOCK_SIDE_EFFECT_FROM_ROUTE/TMS/POD   | contratos + pruebas SQL                       | 0                 |
| Offline cross-user                     | `syncManager.test.js`                         | 0                 |
| PWA sensitive cache                    | `pwaConfigContract.test.js`                   | NetworkOnly       |
| Build                                  | `npm run build`                               | exit 0            |

## Secuencia obligatoria

BASELINE → FLAG → NEW PATH → SHADOW → TEST → PILOT → CUTOVER → OBSERVE.
