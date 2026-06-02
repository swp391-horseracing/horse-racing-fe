export type Description = {
  title: string;
  content: string;
  url?: string;
};

export type ExtendedProps = {
  descriptions?: Description[];
  comments?: Comment[];
  location?: string;
  priority?: number;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date?: string;
  start?: string;
  end?: string;
  url?: string;
  className?: string;
  extendedProps?: ExtendedProps;
  overlap: boolean;
  editable: boolean;
};
