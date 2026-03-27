import { promises as fs } from "node:fs";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { TransactionModel } from "../models/transaction";
import { createZipFile } from "../utils/create-zip-file";
import { TransactionService } from "./transanctionService";
import { getUserById } from "./userService";

export class GDPRService {
  private txService: TransactionService;

  constructor() {
    this.txService = new TransactionService(new TransactionModel());
  }

  async exportUserData(userId: string) {
    const tempDir = path.join("/temp", `export-${uuid}`);
    await fs.mkdir(tempDir, { recursive: true });

    try {
      const user = await getUserById(userId);
      const txs = await this.txService.findByUserId(userId);
      // const auditLogs = await getAuditLogs(userId); // Only if there is a user log tray

      // Creat JSON files
      await fs.writeFile(
        path.join(tempDir, "profile.json"),
        JSON.stringify(user, null, 2),
      );
      await fs.writeFile(
        path.join(tempDir, "transactions.json"),
        JSON.stringify(txs, null, 2),
      );
      // await fs.writeFile(path.join(tempDir, 'transactions.json'), JSON.stringify(auditLogs, null, 2));

      // Create zip file
      const zipPath = path.join(
        "/temp",
        `gdpr-export-${userId}-${Date.now()}.zip`,
      );
      await createZipFile(tempDir, zipPath);

      // Cleanup
      await fs.rm(tempDir, { recursive: true });

      return zipPath;
    } catch (err) {
      await fs.rm(tempDir, { recursive: true }).catch(() => {});
      throw err;
    }
  }
}
