import React from "react";
import OrganizationPreview from "./OrganizationPreview";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfiniteScroll from "react-infinite-scroller";

import LoadingSpinner from "../general/LoadingSpinner";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
});

export default function OrganizationPreviews({
  hasMore,
  loadFunc,
  organizations,
  parentHandlesGridItems,
  showOrganizationType,
}) {
  const classes = useStyles();

  const toOrganizationPreviews = (organizations) =>
    organizations.map((o) => (
      <GridItem key={o.url_slug} organization={o} showOrganizationType={showOrganizationType} />
    ));

  const [gridItems, setGridItems] = React.useState(toOrganizationPreviews(organizations));
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);

  if (!loadFunc) {
    hasMore = false;
  }

  const loadMore = async (page) => {
    // Sometimes InfiniteScroll calls loadMore twice really fast. Therefore
    // to improve performance, we aim to guard against subsequent
    // fetches to the API by maintaining a local state flag.
    if (!isFetchingMore) {
      setIsFetchingMore(true);
      const newOrganizations = await loadFunc(page);
      if (!parentHandlesGridItems) {
        setGridItems([...gridItems, ...toOrganizationPreviews(newOrganizations)]);
      }
      setIsFetchingMore(false);
    }
  };

  // TODO: use `organization.id` instead of index when using real organizations
  return (
    <>
      <InfiniteScroll
        className={`${classes.reset} ${classes.root}`}
        component="ul"
        container
        element={Grid}
        // We block subsequent invocations from InfinteScroll until we update local state
        hasMore={hasMore && !isFetchingMore}
        loadMore={loadMore}
        pageStart={0}
        spacing={2}
      >
        {parentHandlesGridItems
          ? organizations && organizations.length > 0
            ? toOrganizationPreviews(organizations)
            : "No organizations found. Try changing or removing your filter or search query."
          : gridItems}
        {isFetchingMore && <LoadingSpinner isLoading key="organization-previews-spinner" />}
      </InfiniteScroll>
    </>
  );
}

function GridItem({ organization, showOrganizationType }) {
  return (
    <Grid key={organization.url_slug} item xs={12} sm={6} md={4} lg={3} component="li">
      <OrganizationPreview
        organization={organization}
        showOrganizationType={showOrganizationType}
      />
    </Grid>
  );
}
