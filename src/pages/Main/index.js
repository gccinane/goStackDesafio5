import React, { Component } from 'react';
import { Form, SubmitButton, List } from './styles';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import Container from '../../components/Container';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: 0,
    found: 1,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = (e) => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async (e) => {
    try {
      e.preventDefault();
      this.setState({ loading: 1, found: 1 });
      const { newRepo, repositories } = this.state;
      console.log(this.state.found);
      if (newRepo === '') throw 'Indique novo Repositório';

      const hasRepo = repositories.find((repo) => repo.name === newRepo);

      if (hasRepo) throw 'Repositório já existe';

      const response = await api.get(`/repos/${newRepo}`);
      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: 0,
      });
    } catch (error) {
      this.setState({ found: 0 });
    } finally {
      this.setState({ loading: 0 });
    }
  };

  render() {
    const { newRepo, loading, repositories, found } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>
        <Form onSubmit={this.handleSubmit} error={found}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading} found={found}>
            {loading ? (
              <FaSpinner color="#fff " size={14} />
            ) : (
                <FaPlus color="#fff" size={14} /> // eslint-disable-line no-console
              )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map((repository) => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
