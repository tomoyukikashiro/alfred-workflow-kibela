#!/usr/bin/env node

const alfy = require("alfy");
const fetch = require("node-fetch");
const gql = require("graphql-tag");
const { print } = require("graphql/language/printer");

const TEAM = process.env.kibela_team;
const TOKEN = process.env.kibela_token;
const API_ENDPOINT = `https://${TEAM}.kibe.la/api/v1`;
const USER_AGENT = `alfred_workflow`;
const QUERY = process.argv[2]

const query = gql`
  query ($query: String!) {
    search(query: $query, first: 100) {
      edges {
        node {
          title
          url
          folder {
            name
          }
        }
      }
    }
  }
`;

const format = notes => {
	if (!notes) return [];
  return notes.map(note => {
    const node = note.node
    return {
      uuid: node.url,
      title: node.title,
      subtitle: node.folder && node.folder.name,
      arg: node.url
    }
  });
}

(async () => {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    redirect: "follow",
    mode: "cors",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": USER_AGENT
    },
    body: JSON.stringify({
      query: print(query),
      variables: { query: QUERY }
    })
  });

  const body = await response.json();
  alfy.output(format(body.data.search.edges));
})();
