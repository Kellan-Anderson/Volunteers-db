import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export function useUrlState(selector: string) {
  const pathname = usePathname();
  const router = useRouter();
  const defaultSearchParams = useSearchParams();

  const searchParams = new URLSearchParams(defaultSearchParams);

  const pushUrl = () => router.push(`${pathname}?${searchParams.toString()}`);

  const pushUrlItem = (item: string) => {
    if(!searchParams.has(selector, item)) {
      searchParams.append(selector, item)
      pushUrl();
    }
  }

  const removeItem = (item: string) => {
    searchParams.delete(selector, item);
    pushUrl();
  }

  const pushSingleItem = (item: string) => {
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

  return { pushSingleItem, pushUrlItem, removeItem, replaceItem }
}