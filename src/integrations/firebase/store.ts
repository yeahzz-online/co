import {
  collectionRef,
  deleteDoc,
  documentRef,
  getDocs,
  query,
  setDoc,
  where,
} from "@/integrations/firebase/firestore";

type Row = Record<string, unknown> & { id?: string };

class CollectionQuery {
  private filters: Array<[string, unknown]> = [];
  private sort?: { field: string; ascending: boolean };
  private take?: number;
  private operation: "read" | "update" | "insert" | "delete" = "read";
  private payload: Row | Row[] = {};

  constructor(private readonly name: string) {}
  select(_columns = "*", _options?: unknown) {
    return this;
  }
  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
    return this;
  }
  order(field: string, options?: { ascending?: boolean }) {
    this.sort = { field, ascending: options?.ascending ?? true };
    return this;
  }
  limit(value: number) {
    this.take = value;
    return this;
  }
  update(payload: Row) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }
  insert(payload: Row | Row[]) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }
  delete() {
    this.operation = "delete";
    return this;
  }
  maybeSingle() {
    return this.execute().then((result) => ({
      data: result.data?.[0] ?? null,
      error: result.error,
    }));
  }

  then<TResult1 = { data: Row[]; error: Error | null }, TResult2 = never>(
    onfulfilled?:
      ((value: { data: Row[]; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<{ data: Row[]; error: Error | null; count?: number }> {
    try {
      if (this.operation === "insert") {
        const items = Array.isArray(this.payload) ? this.payload : [this.payload];
        await Promise.all(
          items.map(async (item) => {
            const id = item.id ? String(item.id) : crypto.randomUUID();
            await setDoc(documentRef(`${this.name}/${id}`), { ...item, id }, { merge: true });
          }),
        );
        return { data: [], error: null };
      }
      if (this.operation === "update" || this.operation === "delete") {
        const snapshot = await getDocs(collectionRef<Row>(this.name));
        const matches = snapshot.docs.filter((item) =>
          this.filters.every(([field, value]) => item.data()[field] === value),
        );
        await Promise.all(
          matches.map((item) =>
            this.operation === "delete"
              ? deleteDoc(item.ref)
              : setDoc(item.ref, this.payload as Row, { merge: true }),
          ),
        );
        return { data: [], error: null };
      }
      const constraints = this.filters.map(([field, value]) => where(field, "==", value));
      const snapshot = await getDocs(query(collectionRef<Row>(this.name), ...constraints));
      let data: Row[] = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      if (this.sort)
        data.sort(
          (a, b) =>
            String(a[this.sort!.field] ?? "").localeCompare(String(b[this.sort!.field] ?? "")) *
            (this.sort!.ascending ? 1 : -1),
        );
      if (this.take) data = data.slice(0, this.take);
      return { data, count: data.length, error: null };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}

export const firebaseStore = {
  from(name: string) {
    return new CollectionQuery(name);
  },
  functions: {
    invoke: async () => ({
      data: null,
      error: new Error("Email campaigns are not configured for Firebase yet."),
    }),
  },
};
