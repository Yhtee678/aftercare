import { z } from "zod";

// Built-in Chinese validation messages, including type/length errors without custom copy.
z.config(z.locales.zhCN());
export { z };
