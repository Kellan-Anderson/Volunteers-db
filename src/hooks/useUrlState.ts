import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export function useUrlState(selector: string) {
  const pathname = usePathname();
  const router = useRouter();
  const defaultSearchParams = useSearchParams();

  const searchParams = new URLSearchParams(defaultSearchParams);

  const pushUrl = () => router.push(`${pathname}?${searchParams.toString()}`);

  const pushItem = (item: string) => {
    searchParams.set(selector, item)
    pushUrl();
  }

  const removeItem = (item: string) => {
    searchParams.delete(selector, item);
    pushUrl();
  }

  const appendItem = (item: string) => {
    if(searchParams.has(selector)) {
      searchParams.set(selector, item)
    } else {
      searchParams.append(selector, item)
    }
    pushUrl();
  }

  const replaceItem = (item: string) => {
    searchParams.delete(selector);
    searchParams.set(selector, item);
    pushUrl();
  }

  return { appendItem, pushItem, removeItem, replaceItem }
}